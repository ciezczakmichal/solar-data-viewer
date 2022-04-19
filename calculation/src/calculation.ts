import currency from 'currency.js'
import {
    EnergyProducedInfo,
    MeterInfo,
    PlantProperties,
    TariffItem,
} from 'format'
import { calculateEnergyCost } from './energy-cost'
import { parseDate } from './utils/parse-date'

export interface EnergyCalculationInput {
    producedDb: EnergyProducedInfo[]
    meterDb: MeterInfo[]
    properties: PlantProperties
}

export interface EnergyCalculationResult {
    days: number

    produced: number
    dailyProduction: number
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
    const { producedDb, meterDb, properties } = input

    const produced = producedDb[producedDb.length - 1].value
    const kWhTokWp = produced / properties.installationPower

    const baseMeterValue = meterDb[0]
    const lastMeterValue = meterDb[meterDb.length - 1]

    const lastDate = parseDate(lastMeterValue.date)
    const baseDate = parseDate(baseMeterValue.date)
    const days = lastDate.diff(baseDate, 'days')

    const charged = lastMeterValue.charged - baseMeterValue.charged
    const donated = lastMeterValue.donated - baseMeterValue.donated
    const donatedToUse = donated * properties.energyInWarehouseFactor

    const selfConsumed = produced - donated
    const selfConsumedPercent = selfConsumed / produced

    const dailyProduction = produced / days

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
        produced,
        dailyProduction,
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
