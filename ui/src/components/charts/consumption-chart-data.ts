import type { CompleteValuesRecord, SolarData } from 'schema'
import { calculateEnergy, MetersDataHelper } from 'calculation'
import { getCompleteRecordsForRange } from '../../computation/records-for-range'
import {
    getChartData,
    type ChartDataItem,
    type ChartOptions,
} from '../../computation/chart-data'

export interface ConsumptionChartInput {
    from: CompleteValuesRecord
    data: SolarData
    metersHelper: MetersDataHelper
    options: ChartOptions
}

export type ConsumptionChartData = ChartDataItem[]

export function getConsumptionChartData(
    input: ConsumptionChartInput
): ConsumptionChartData {
    const { from, data, metersHelper, options } = input
    const records = getCompleteRecordsForRange(data.values, options.range)

    return getChartData(from, records, options, ({ from, to }) => {
        const { totalConsumption } = calculateEnergy({
            from,
            to,
            plantProperties: data.plantProperties,
            metersHelper,
        })

        return { y: totalConsumption }
    })
}
