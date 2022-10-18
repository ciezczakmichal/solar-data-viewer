import currency from 'currency.js'
import { PlantProperties } from 'schema'

type InvestmentCalculationInputPlantProperties = Pick<
    PlantProperties,
    'investmentCost'
>

export interface InvestmentCalculationInput {
    plantProperties: InvestmentCalculationInputPlantProperties

    days: number
    savings: currency
    savedEnergy: number
    currentEnergyCost: currency
}

export interface InvestmentCalculationResult {
    // liczba dni pozostałych do zwrotu inwestycji (relatywnie, licząc od dnia ostatniego pomiaru)
    daysToInvestmentReturn: number
}

/**
 * Zwraca dane dotyczące zwrotu z inwestycji.
 * @param input Dane wejściowe
 * @returns Obiekt zawierający dane wynikowe
 */
export function calculateInvestment(
    input: InvestmentCalculationInput
): InvestmentCalculationResult {
    const { plantProperties, days, savings, savedEnergy, currentEnergyCost } =
        input

    const remainingCost = plantProperties.investmentCost - savings.value
    const dailyEnergySavings = savedEnergy / days
    const daysToInvestmentReturn =
        remainingCost / (currentEnergyCost.value * dailyEnergySavings)

    return {
        daysToInvestmentReturn,
    }
}
