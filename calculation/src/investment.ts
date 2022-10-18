import currency from 'currency.js'
import { PlantProperties } from 'schema'
import { TimeVaryingValuesHelper } from './time-varying-values-helper'
import { calculateEnergyCost } from './energy-cost'

type InvestmentCalculationInputPlantProperties = Pick<
    PlantProperties,
    'investmentCost'
>

export interface InvestmentCalculationInput {
    lastValueDate: string
    plantProperties: InvestmentCalculationInputPlantProperties

    timeVaryingHelper: TimeVaryingValuesHelper

    days: number
    savings: currency
    savedEnergy: number
}

export interface InvestmentCalculationResult {
    // średnia oszczędność na dzień
    dailySaving: currency

    // bieżąca oszczędność na 1 kWh (obecna cena prądu - koszty zmienne)
    currentSavingsPerKwh: currency

    // liczba dni pozostałych do zwrotu inwestycji (relatywnie, licząc od dnia ostatniego pomiaru)
    daysToInvestmentReturn: number
}

export function calculateInvestment(
    input: InvestmentCalculationInput
): InvestmentCalculationResult {
    const {
        lastValueDate,
        plantProperties,
        timeVaryingHelper,
        days,
        savings,
        savedEnergy,
    } = input

    const dailySaving = savings.divide(days)
    const currentSavingsPerKwh = calculateEnergyCost({
        timeVaryingHelper,
        from: lastValueDate,
        to: lastValueDate,
        energy: 1,
    })

    const remainingCost = plantProperties.investmentCost - savings.value
    const dailyEnergySavings = savedEnergy / days
    const daysToInvestmentReturn =
        remainingCost / (currentSavingsPerKwh.value * dailyEnergySavings)

    return {
        dailySaving,
        currentSavingsPerKwh,
        daysToInvestmentReturn,
    }
}
