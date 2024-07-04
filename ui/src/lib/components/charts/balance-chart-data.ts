import type { CompleteValuesRecord, SolarData } from 'schema'
import { MetersDataHelper, calculateEnergy } from 'calculation'
import {
    type ChartDataItem,
    type ChartOptions,
    getChartData,
} from '../../computation/chart-data'
import { getCompleteRecordsForRange } from '../../computation/records-for-range'

export interface BalanceChartInput {
    from: CompleteValuesRecord
    data: SolarData
    metersHelper: MetersDataHelper
    options: ChartOptions
}

export type BalanceChartData = ChartDataItem[]

export function getBalanceChartData(
    input: BalanceChartInput,
): BalanceChartData {
    const { from, data, metersHelper, options } = input
    const records = getCompleteRecordsForRange(data.values, options.range)

    return getChartData(from, records, options, ({ from, to }) => {
        const { energyToChargeOrBuy } = calculateEnergy({
            from,
            to,
            plantProperties: data.plantProperties,
            metersHelper,
        })

        return { y: energyToChargeOrBuy }
    })
}
