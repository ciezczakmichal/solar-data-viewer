import {
    type BaseValuesRecord,
    type CompleteValuesRecord,
    isCompleteRecord,
    type PlantProperties,
    type ValuesRecordNumberProps,
    type YieldValuesRecord,
} from 'schema'
import { CalculationError } from './error.js'
import { MetersDataHelper } from './meters-data-helper.js'

export interface BaseEnergyParamsCalculationInputGeneric<
    T extends BaseValuesRecord,
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
    'energyInWarehouseFactor' | 'installationPower'
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

    selfConsumption: number
    selfConsumptionPercent: number

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
    demandFulfillmentPercent: number

    // ilość energii, którą pomimo bilansowania należy zakupić
    energyToBuy: number

    // ilość energii, którą można pobrać z sieci, tj. nadwyżka (uwzględnia współczynnik - czyli tyle można pobrać)
    energyToCharge: number

    // równe energyToCharge, jeśli jest ono większe od 0, w przeciwnym wypadku równe energyToBuy * -1
    energyToChargeOrBuy: number
}

export function calculateBaseEnergyParams(
    input: BaseEnergyParamsCalculationInput,
): BaseEnergyParamsCalculationResult
export function calculateBaseEnergyParams(
    input: BaseEnergyParamsCalculationInputYieldVersion,
): Pick<BaseEnergyParamsCalculationResult, 'totalYield'>
export function calculateBaseEnergyParams(
    input:
        | BaseEnergyParamsCalculationInput
        | BaseEnergyParamsCalculationInputYieldVersion,
):
    | BaseEnergyParamsCalculationResult
    | Pick<BaseEnergyParamsCalculationResult, 'totalYield'> {
    let finalInput: BaseEnergyParamsCalculationInput

    if (isCompleteRecord(input.from) && isCompleteRecord(input.to)) {
        return calculateBaseEnergyParamsImpl(
            input as BaseEnergyParamsCalculationInput,
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
    input: BaseEnergyParamsCalculationInput,
): BaseEnergyParamsCalculationResult {
    const { from, to, metersHelper } = input

    if (!metersHelper && from.meterId !== to.meterId) {
        throw new CalculationError(
            `Nie przekazano obiektu ${MetersDataHelper.name}, a wartości liczbowe pochodzą z różnych liczników`,
        )
    }

    const metersId = metersHelper
        ? metersHelper.getMetersIdForPeriod(from, to)
        : [from.meterId]

    let charged = 0,
        donated = 0,
        totalYield = 0

    while (metersId.length > 0) {
        const currentMeterId = metersId.shift() as number

        const currentFrom =
            from.meterId !== currentMeterId && metersHelper
                ? metersHelper.getMeterInitialValuesAsCompleteRecord(
                      currentMeterId,
                  )
                : from

        const currentTo =
            to.meterId !== currentMeterId && metersHelper
                ? metersHelper.getLastMeterValue(currentMeterId)
                : to

        totalYield += currentTo.totalYield - currentFrom.totalYield
        charged += currentTo.charged - currentFrom.charged
        donated += currentTo.donated - currentFrom.donated
    }

    return { totalYield, charged, donated }
}

export function calculateEnergy(
    input: EnergyCalculationInput,
): EnergyCalculationResult {
    const { from, to, plantProperties } = input
    const { totalYield, charged, donated } = calculateBaseEnergyParams(input)

    const kWhTokWp = totalYield / plantProperties.installationPower
    const days = to.date.diff(from.date, 'days')

    const donatedToUse = donated * plantProperties.energyInWarehouseFactor

    const selfConsumption = totalYield - donated
    const selfConsumptionPercent = selfConsumption / totalYield

    const dailyYield = totalYield / days

    const totalConsumption = selfConsumption + charged
    const dailyConsumption = totalConsumption / days
    const monthlyConsumption = dailyConsumption * (365 / 12)

    let demandFulfillmentPercent: number,
        energyToBuy: number,
        energyToCharge: number,
        energyToChargeOrBuy: number,
        savedEnergy: number

    const fulfillNeeds = donatedToUse >= charged

    if (fulfillNeeds) {
        savedEnergy = totalConsumption
        demandFulfillmentPercent = 1
        energyToBuy = 0
        energyToCharge = donatedToUse - charged
        energyToChargeOrBuy = energyToCharge
    } else {
        energyToBuy = charged - donatedToUse
        energyToCharge = 0
        energyToChargeOrBuy = -energyToBuy

        savedEnergy = charged - energyToBuy + selfConsumption
        demandFulfillmentPercent =
            (totalConsumption - energyToBuy) / totalConsumption
    }

    return {
        days,
        totalYield,
        dailyYield,
        kWhTokWp,
        selfConsumption,
        selfConsumptionPercent,
        donated,
        donatedToUse,
        charged,
        totalConsumption,
        dailyConsumption,
        monthlyConsumption,

        fulfillNeeds,
        savedEnergy,
        demandFulfillmentPercent,
        energyToBuy,
        energyToCharge,
        energyToChargeOrBuy,
    }
}
