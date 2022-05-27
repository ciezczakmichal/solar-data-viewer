import currency from 'currency.js'
import { CompleteValuesRecord, PlantProperties, TariffItem } from 'format'
import { calculateEnergyCost } from './energy-cost'
import { parseDate } from './utils/parse-date'

export type EnergyCalculationInputPlantProperties = Pick<
    PlantProperties,
    'installationPower' | 'energyInWarehouseFactor'
>

export interface EnergyCalculationInput {
    from: CompleteValuesRecord
    to: CompleteValuesRecord
    plantProperties: EnergyCalculationInputPlantProperties
}

export interface EnergyCalculationResult {
    days: number

    totalYield: number
    dailyYield: number
    kWhTokWp: number

    selfConsumed: number
    selfConsumedPercent: number

    donated: number
    donatedToUse: number
    charged: number
    totalConsumption: number
    dailyConsumption: number

    // informacja, czy produkcja instalacji spełnia zapotrzebowanie (tj. energyToBuy == 0)
    fulfillNeeds: boolean

    // ilość energii, która musiała by być dodatkowo pobrana z sieci, gdyby nie istniały panele (i bilansowanie)
    savedEnergy: number

    // procent spełnienia zapotrzebowania przez energię wyprodukowaną (wartości 0-1)
    needsFulfilmentPercent: number

    // ilość energii, którą pomimo bilansowania należy zakupić
    energyToBuy: number

    // ilość energii, którą można pobrać z sieci, tj. nadwyżka (uwzględnia współczynnik - czyli tyle można pobrać)
    energyToCharge: number
}

export interface InvestmentCalculationInput {
    days: number
    savedEnergy: number
    investmentCost: number
    tariffItems: TariffItem[]
}

export interface InvestmentCalculationResult {
    savedCost: currency
    dailySaving: currency
    daysToReturnInvestment: number
}

export function calculateEnergy(
    input: EnergyCalculationInput
): EnergyCalculationResult {
    const { from, to, plantProperties } = input

    const totalYield = to.totalYield - from.totalYield
    const kWhTokWp = totalYield / plantProperties.installationPower

    const lastDate = parseDate(to.date)
    const baseDate = parseDate(from.date)
    const days = lastDate.diff(baseDate, 'days')

    const charged = to.charged - from.charged
    const donated = to.donated - from.donated
    const donatedToUse = donated * plantProperties.energyInWarehouseFactor

    const selfConsumed = totalYield - donated
    const selfConsumedPercent = selfConsumed / totalYield

    const dailyYield = totalYield / days

    const totalConsumption = selfConsumed + charged
    const dailyConsumption = totalConsumption / days

    let savedEnergy: number,
        needsFulfilmentPercent: number,
        energyToBuy: number,
        energyToCharge: number

    const fulfillNeeds = donatedToUse >= charged

    if (fulfillNeeds) {
        savedEnergy = totalConsumption
        needsFulfilmentPercent = 1
        energyToBuy = 0
        energyToCharge = donatedToUse - charged
    } else {
        energyToBuy = charged - donatedToUse
        energyToCharge = 0

        savedEnergy = charged - energyToBuy + selfConsumed
        needsFulfilmentPercent =
            (totalConsumption - energyToBuy) / totalConsumption
    }

    return {
        days,
        totalYield,
        dailyYield,
        kWhTokWp,
        selfConsumed,
        selfConsumedPercent,
        donated,
        donatedToUse,
        charged,
        totalConsumption,
        dailyConsumption,

        fulfillNeeds,
        savedEnergy,
        needsFulfilmentPercent,
        energyToBuy,
        energyToCharge,
    }
}

export function calculateInvestment(
    input: InvestmentCalculationInput
): InvestmentCalculationResult {
    const { days, savedEnergy, investmentCost, tariffItems } = input

    const savedCost = calculateEnergyCost(savedEnergy, tariffItems)
    const dailySaving = savedCost.divide(days)
    const daysToReturnInvestment = investmentCost / dailySaving.value

    return {
        savedCost,
        dailySaving,
        daysToReturnInvestment,
    }
}
