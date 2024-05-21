import currency from 'currency.js'
import type { PlantProperties } from 'schema'

type InvestmentCalculationInputPlantProperties = Pick<
    PlantProperties,
    'investmentCost'
>

export interface InvestmentCalculationInput {
    plantProperties: InvestmentCalculationInputPlantProperties

    // kwota oszczędności - koszt zakupu prądu wyprodukowanego i zużytego
    savings: currency

    // średnia oszczędność energii na dzień - NIE średnie zużycie
    dailyEnergySavings: number

    // obecny koszt 1 kWh energii
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
    input: InvestmentCalculationInput,
): InvestmentCalculationResult {
    const { plantProperties, savings, dailyEnergySavings, currentEnergyCost } =
        input

    const remainingCost = plantProperties.investmentCost - savings.value
    const daysToInvestmentReturn =
        remainingCost / currentEnergyCost.multiply(dailyEnergySavings).value

    return {
        daysToInvestmentReturn,
    }
}
