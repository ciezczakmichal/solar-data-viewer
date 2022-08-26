import type { CompleteValuesRecord, SolarDataFormat } from 'schema'
import { calculateEnergy, MetersDataHelper } from 'calculation'
import { getCompleteRecordsForRange } from '../../computation/records-for-range'
import {
    getChartData,
    type ChartDataItem,
    type ChartOptions,
} from '../../computation/chart-data'

export interface BalanceChartInput {
    from: CompleteValuesRecord
    data: SolarDataFormat
    metersHelper: MetersDataHelper
    options: ChartOptions
}

export type BalanceChartData = ChartDataItem[]

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
