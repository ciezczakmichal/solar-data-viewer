import currency from 'currency.js'
import { MeterRecord, PlantProperties, TariffItem, YieldRecord } from 'format'
import { calculateEnergyCost } from './energy-cost'
import { parseDate } from './utils/parse-date'

export interface EnergyCalculationInput {
    yieldData: YieldRecord[]
    meterData: MeterRecord[]
    properties: PlantProperties
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
    const { yieldData, meterData, properties } = input

    const totalYield = yieldData[yieldData.length - 1].value
    const kWhTokWp = totalYield / properties.installationPower

    const baseMeterValue = meterData[0]
    const lastMeterValue = meterData[meterData.length - 1]

    const lastDate = parseDate(lastMeterValue.date)
    const baseDate = parseDate(baseMeterValue.date)
    const days = lastDate.diff(baseDate, 'days')

    const charged = lastMeterValue.charged - baseMeterValue.charged
    const donated = lastMeterValue.donated - baseMeterValue.donated
    const donatedToUse = donated * properties.energyInWarehouseFactor

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
        const chargedWithFactor = charged / properties.energyInWarehouseFactor

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
