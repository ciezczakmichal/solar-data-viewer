import type { SolarData, ValuesRecord, YieldValuesRecord } from 'schema'
import { type MetersDataHelper, calculateBaseEnergyParams } from 'calculation'
import {
    DataRange,
    getYieldRecordsForRange,
} from '../../computation/records-for-range'
import {
    ChartType,
    getChartData,
    type ChartDataItem,
    type ChartDataItemWithDate,
    type ChartOptions,
} from '../../computation/chart-data'

export interface YieldChartInput {
    from: YieldValuesRecord
    data: SolarData
    metersHelper: MetersDataHelper
    options: ChartOptions
}

export interface YieldChartData {
    yieldData: ChartDataItemWithDate[]
    yieldForecastData: ChartDataItem[]
}

function getYieldData(
    from: YieldValuesRecord,
    values: ValuesRecord[],
    metersHelper: MetersDataHelper,
    options: ChartOptions
): ChartDataItemWithDate[] {
    const records = getYieldRecordsForRange(values, options.range)

    return getChartData(
        from,
        records,
        options,
        (from: YieldValuesRecord, to: YieldValuesRecord) => {
            const result = calculateBaseEnergyParams({
                from,
                to,
                metersHelper,
            })

            return result.totalYield
        }
    )
}

export function getYieldChartData(input: YieldChartInput): YieldChartData {
    const { from, data, metersHelper, options } = input

    const yieldData = getYieldData(from, data.values, metersHelper, options)
    let yieldForecastData: ChartDataItem[] = []

    if (
        options.type === ChartType.Bar &&
        options.range === DataRange.Month &&
        data.yieldForecastData
    ) {
        // znajdź odpowiadające wartości prognozy dla danych produkcji
        for (const yieldItem of yieldData) {
            const item = data.yieldForecastData.find(
                forecastItem =>
                    forecastItem.month === yieldItem.date.month() + 1
            )

            if (item) {
                yieldForecastData.push({
                    x: yieldItem.x,
                    y: item.value,
                })
            }
        }
    }

    return { yieldData, yieldForecastData }
}
