import type { CompleteValuesRecord, SolarData } from 'schema'
import { calculateEnergy, MetersDataHelper } from 'calculation'
import { getCompleteRecordsForRange } from '../../computation/records-for-range'
import {
    getChartData,
    type ChartDataItemWithDate,
    type ChartOptions,
} from '../../computation/chart-data'

export interface ConsumptionChartInput {
    from: CompleteValuesRecord
    data: SolarData
    metersHelper: MetersDataHelper
    options: ChartOptions
}

export type ConsumptionChartData = ChartDataItemWithDate[]

export function getConsumptionChartData(
    input: ConsumptionChartInput
): ConsumptionChartData {
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

            return result.totalConsumption
        }
    )
}
