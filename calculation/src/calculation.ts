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

    fulfillNeeds: boolean
    // ilość energii, która musiała by być dodatkowo pobrana z sieci, gdyby nie istniały panele (i bilansowanie)
    savedEnergy: number
    needsFulfilmentPercent: number
    energyToBuy: number // ilość energii do zakupu
    energyToCharge: number // ilość energii do pobrania (nadwyżka) @todo ze współczynnikiem, czy nie?
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
    investmentReturnYears: number
    investmentReturnMonths: number
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
        const chargedWithFactor =
            charged / plantProperties.energyInWarehouseFactor

        savedEnergy = totalConsumption
        needsFulfilmentPercent = 1
        energyToBuy = 0
        energyToCharge = donated - chargedWithFactor
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
    const investmentReturnYears = Math.floor(daysToReturnInvestment / 365)
    const investmentReturnMonths = Math.floor(
        (daysToReturnInvestment - investmentReturnYears * 365) / 30
    )

    return {
        savedCost,
        dailySaving,
        investmentReturnYears,
        investmentReturnMonths,
    }
}
