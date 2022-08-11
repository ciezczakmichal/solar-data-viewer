import type { SolarDataFormat, ValuesRecord, YieldValuesRecord } from 'format'
import type { MetersDataHelper } from 'calculation'
import { getMonthName } from '../../utils/date'
import {
    DataRange,
    getYieldRecordsForRange,
    type RangeYieldValuesRecord,
} from '../../utils/chart-data'

export enum ChartType {
    Line,
    Bar,
}

export interface ChartOptions {
    type: ChartType
    range: DataRange
}

export interface ChartDataItem {
    x: string
    y: number | null
}

export interface ChartData {
    yieldData: ChartDataItem[]
    yieldForecastData: ChartDataItem[]
}

export function getChartYieldData(
    values: ValuesRecord[],
    metersHelper: MetersDataHelper,
    options: ChartOptions
): ChartDataItem[] {
    const { type, range } = options
    const records = getYieldRecordsForRange(values, range)

    if (records.length === 0) {
        return []
    }

    const first = metersHelper.getMeterInitialValuesAsCompleteRecord(
        metersHelper.getFirstMeterId()
    )

    const result = records.map((item, index) => {
        const previousItem: RangeYieldValuesRecord | null =
            index > 0 ? records[index - 1] : null
        let label = ''

        if (range === DataRange.Week) {
            const currentLabel = item.date.format('DD.MM')

            if (type === ChartType.Line) {
                label = currentLabel
            } else if (previousItem) {
                const previousLabel = previousItem.date
                    .add(1, 'day')
                    .format('DD.MM')
                label = `${previousLabel} - ${currentLabel}`
            }
        } else {
            label = getMonthName(item.date.month())
        }

        let value = null

        if (item.values) {
            let from: YieldValuesRecord | null = null

            if (type === ChartType.Bar) {
                if (previousItem && previousItem.values) {
                    from = previousItem.values
                }
            } else {
                from = first
            }

            if (from) {
                value = item.values.totalYield - from.totalYield
            }
        }

        return {
            x: label,
            y: value,
        }
    })

    // usuń pierwszy rekord dla wykresu kolumnowego, gdyż nie zawiera danych (nie było z czym porównać)
    // w przypadku zakresu miesięcznego wyniki zawierają pierwszy rekord danych i wartość wynosi 0
    if (type === ChartType.Bar || range === DataRange.Month) {
        result.shift()
    }

    return result
}

export function getChartData(
    data: SolarDataFormat,
    metersHelper: MetersDataHelper,
    options: ChartOptions
): ChartData {
    const yieldData = getChartYieldData(data.values, metersHelper, options)
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
