import {
    BaseValuesRecord,
    CompleteValuesRecord,
    isCompleteRecord,
    PlantProperties,
    ValuesRecordNumberProps,
    YieldValuesRecord,
} from 'format'
import { CalculationError } from './error'
import { MetersDataHelper } from './meters-data-helper'
import { parseDate } from './utils/date'

export interface BaseEnergyParamsCalculationInputGeneric<
    T extends BaseValuesRecord
> {
    from: T
    to: T

    // jeśli podano, wspiera przy obliczaniu zmianę liczników
    // wymagane, jeśli wartości liczbowe są dla różnych liczników (rzuca wyjątkiem)
    metersHelper?: MetersDataHelper
}

export type BaseEnergyParamsCalculationInput =
    BaseEnergyParamsCalculationInputGeneric<CompleteValuesRecord>
export type BaseEnergyParamsCalculationInputYieldVersion =
    BaseEnergyParamsCalculationInputGeneric<YieldValuesRecord>

export type BaseEnergyParamsCalculationResult = Pick<
    EnergyCalculationResult,
    ValuesRecordNumberProps
>

export type EnergyCalculationInputPlantProperties = Pick<
    PlantProperties,
    'installationPower' | 'energyInWarehouseFactor'
>

export interface EnergyCalculationInput
    extends BaseEnergyParamsCalculationInput {
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
    monthlyConsumption: number

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

export function calculateBaseEnergyParams(
    input: BaseEnergyParamsCalculationInput
): BaseEnergyParamsCalculationResult
export function calculateBaseEnergyParams(
    input: BaseEnergyParamsCalculationInputYieldVersion
): Pick<BaseEnergyParamsCalculationResult, 'totalYield'>
export function calculateBaseEnergyParams(
    input:
        | BaseEnergyParamsCalculationInput
        | BaseEnergyParamsCalculationInputYieldVersion
):
    | BaseEnergyParamsCalculationResult
    | Pick<BaseEnergyParamsCalculationResult, 'totalYield'> {
    let finalInput: BaseEnergyParamsCalculationInput

    if (isCompleteRecord(input.from) && isCompleteRecord(input.to)) {
        return calculateBaseEnergyParamsImpl(
            input as BaseEnergyParamsCalculationInput
        )
    } else {
        // uzupełnij pozostałe dane wartościami 0, a potem usuń ze zwracanego obiektu
        finalInput = {
            ...input,
            from: {
                ...input.from,
                charged: 0,
                donated: 0,
            },
            to: {
                ...input.to,
                charged: 0,
                donated: 0,
            },
        }

        const { totalYield } = calculateBaseEnergyParamsImpl(finalInput)
        return { totalYield }
    }
}

function calculateBaseEnergyParamsImpl(
    input: BaseEnergyParamsCalculationInput
): BaseEnergyParamsCalculationResult {
    const { from, to, metersHelper } = input
    let totalYield: number = 0,
        charged: number = 0,
        donated: number = 0

    if (!metersHelper && from.meterId !== to.meterId) {
        throw new CalculationError(
            `Nie przekazano obiektu ${MetersDataHelper.name}, a wartości liczbowe pochodzą z różnych liczników`
        )
    }

    const metersId = metersHelper
        ? metersHelper.getMetersIdForPeriod(from, to)
        : []

    if (metersHelper && metersId.length >= 2) {
        while (metersId.length >= 2) {
            const currentMeterId = metersId.shift() as number
            const nextMeterId = metersId[0]

            const lastValue = metersHelper.getLastMeterValue(currentMeterId)
            const initialValue =
                metersHelper.getMeterInitialValuesAsCompleteRecord(nextMeterId)

            const getValue = (field: ValuesRecordNumberProps): number =>
                lastValue[field] - from[field] + to[field] - initialValue[field]

            totalYield += getValue('totalYield')
            charged += getValue('charged')
            donated += getValue('donated')
        }
    } else {
        totalYield = to.totalYield - from.totalYield
        charged = to.charged - from.charged
        donated = to.donated - from.donated
    }

    return { totalYield, charged, donated }
}

export function calculateEnergy(
    input: EnergyCalculationInput
): EnergyCalculationResult {
    const { from, to, plantProperties } = input
    const { totalYield, charged, donated } = calculateBaseEnergyParams(input)

    const kWhTokWp = totalYield / plantProperties.installationPower

    const lastDate = parseDate(to.date)
    const baseDate = parseDate(from.date)
    const days = lastDate.diff(baseDate, 'days')

    const donatedToUse = donated * plantProperties.energyInWarehouseFactor

    const selfConsumed = totalYield - donated
    const selfConsumedPercent = selfConsumed / totalYield

    const dailyYield = totalYield / days

    const totalConsumption = selfConsumed + charged
    const dailyConsumption = totalConsumption / days
    const monthlyConsumption = dailyConsumption * (365 / 12)

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
        monthlyConsumption,

        fulfillNeeds,
        savedEnergy,
        needsFulfilmentPercent,
        energyToBuy,
        energyToCharge,
    }
}
