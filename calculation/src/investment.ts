import currency from 'currency.js'
import { PlantProperties } from 'format'
import { EnergyCalculationInputPlantProperties } from './calculation'
import { calculateSavings, SavingsCalculationInput } from './savings'

type InvestmentCalculationInputPlantProperties =
    EnergyCalculationInputPlantProperties &
        Pick<PlantProperties, 'investmentCost'>

export interface InvestmentCalculationInput extends SavingsCalculationInput {
    days: number
    plantProperties: InvestmentCalculationInputPlantProperties
}

export interface InvestmentCalculationResult {
    savedCost: currency
    dailySaving: currency
    daysToReturnInvestment: number
}

export function calculateInvestment(
    input: InvestmentCalculationInput
): InvestmentCalculationResult {
    const { days, plantProperties } = input

    const savingsData = calculateSavings(input)
    const dailySaving = savingsData.savings.divide(days)
    const daysToReturnInvestment =
        plantProperties.investmentCost / dailySaving.value

    return {
        savedCost: savingsData.savings,
        dailySaving,
        daysToReturnInvestment,
    }
}
