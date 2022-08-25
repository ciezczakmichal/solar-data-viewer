import type { SolarDataFormat, ValuesRecord, YieldValuesRecord } from 'format'
import {
    DataRange,
    getYieldRecordsForRange,
} from '../../computation/records-for-range'
import {
    ChartType,
    getChartData,
    type ChartDataItem,
    type ChartOptions,
} from '../../computation/chart-data'
import { getMonthName } from '../../utils/date'

export interface YieldChartInput {
    from: YieldValuesRecord
    data: SolarDataFormat
    options: ChartOptions
}

export interface YieldChartData {
    yieldData: ChartDataItem[]
    yieldForecastData: ChartDataItem[]
}

function getYieldData(
    from: YieldValuesRecord,
    values: ValuesRecord[],
    options: ChartOptions
): ChartDataItem[] {
    const records = getYieldRecordsForRange(values, options.range)

    return getChartData(
        from,
        records,
        options,
        (from: YieldValuesRecord, to: YieldValuesRecord) =>
            to.totalYield - from.totalYield
    )
}

export function getYieldChartData(input: YieldChartInput): YieldChartData {
    const { from, data, options } = input

    const yieldData = getYieldData(from, data.values, options)
    let yieldForecastData: ChartDataItem[] = []

    if (options.type === ChartType.Bar && options.range === DataRange.Month) {
        // pokaż dane dla miesięcy, dla których dostępne są dane produkcji
        yieldForecastData = (data.yieldForecastData || [])
            .map(item => ({
                x: getMonthName(item.month - 1),
                y: item.value,
            }))
            .filter(item => yieldData.some(yieldItem => yieldItem.x === item.x))
    }

    return { yieldData, yieldForecastData }
}
