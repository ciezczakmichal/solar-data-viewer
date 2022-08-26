import currency from 'currency.js'
import { PlantProperties, TariffItem, VatRateItem } from 'schema'
import { calculateEnergyCost } from './energy-cost'

type InvestmentCalculationInputPlantProperties = Pick<
    PlantProperties,
    'investmentCost'
>

export interface InvestmentCalculationInput {
    lastValueDate: string
    tariff: TariffItem[]
    vatRate: VatRateItem[]
    plantProperties: InvestmentCalculationInputPlantProperties

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
        tariff,
        vatRate,
        plantProperties,
        days,
        savings,
        savedEnergy,
    } = input

    const dailySaving = savings.divide(days)
    const currentSavingsPerKwh = calculateEnergyCost({
        tariff,
        vatRate,
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
