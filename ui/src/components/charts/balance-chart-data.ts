import type { CompleteValuesRecord, SolarData } from 'schema'
import { calculateEnergy, MetersDataHelper } from 'calculation'
import { getCompleteRecordsForRange } from '../../computation/records-for-range'
import {
    getChartData,
    type ChartDataItemWithDate,
    type ChartOptions,
} from '../../computation/chart-data'

export interface BalanceChartInput {
    from: CompleteValuesRecord
    data: SolarData
    metersHelper: MetersDataHelper
    options: ChartOptions
}

export type BalanceChartData = ChartDataItemWithDate[]

export function getBalanceChartData(
    input: BalanceChartInput
): BalanceChartData {
    const { from, data, metersHelper, options } = input
    const records = getCompleteRecordsForRange(data.values, options.range)

    return getChartData(
        from,
        records,
        options,
        (from: CompleteValuesRecord, to: CompleteValuesRecord) => {
            const result = calculateEnergy({
                from,
                to,
                plantProperties: data.plantProperties,
                metersHelper,
            })

            return result.energyToChargeOrBuy
        }
    )
}
