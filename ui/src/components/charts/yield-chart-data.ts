import type { DataFormat, ValuesRecord } from 'format'
import { parseDate } from 'calculation'
import { getMonthName } from '../../utils/date'
import { DataRange, getYieldRecordsForRange } from '../../utils/chart-data'

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
    y: number
}

export interface ChartData {
    yieldData: ChartDataItem[]
    yieldForecastData: ChartDataItem[]
}

export function getChartYieldData(
    values: ValuesRecord[],
    options: ChartOptions
): ChartDataItem[] {
    const { type, range } = options
    const records = getYieldRecordsForRange(values, range)

    return records.map((item, index) => {
        const previousItem: ValuesRecord | null =
            index > 0 ? records[index - 1] : null
        const date = parseDate(item.date)
        let label, value

        if (range === DataRange.Week) {
            const currentLabel = date.format('DD.MM')

            if (type === ChartType.Line) {
                label = currentLabel
            } else if (previousItem) {
                const previousLabel = parseDate(previousItem.date)
                    .add(1, 'day')
                    .format('DD.MM')
                label = `${previousLabel} - ${currentLabel}`
            } else {
                label = `do ${currentLabel}`
            }
        } else {
            label = getMonthName(date.month())
        }

        if (type === ChartType.Bar) {
            value = item.totalYield - (previousItem?.totalYield || 0)
        } else {
            value = item.totalYield
        }

        return {
            x: label,
            y: value,
        }
    })
}

export function getChartData(
    data: DataFormat,
    options: ChartOptions
): ChartData {
    const yieldData = getChartYieldData(data.values, options)
    let yieldForecastData: ChartDataItem[] = []

    if (options.type === ChartType.Bar && options.range === DataRange.Month) {
        // pokaż dane dla miesięcy, dla których dostępne są dane produkcji
        yieldForecastData = data.yieldForecastData
            .map(item => ({
                x: getMonthName(item.month - 1),
                y: item.value,
            }))
            .filter(item => yieldData.some(yieldItem => yieldItem.x === item.x))
    }

    return { yieldData, yieldForecastData }
}
