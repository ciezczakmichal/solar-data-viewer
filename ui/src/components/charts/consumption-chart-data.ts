import {
    isCompleteRecord,
    type CompleteValuesRecord,
    type DataFormat,
} from 'format'
import { calculateEnergy } from 'calculation'
import { getMonthName } from '../../utils/date'
import {
    DataRange,
    getCompleteRecordsForRange,
    type RangeCompleteValuesRecord,
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

export type ChartData = ChartDataItem[]

export function getChartData(
    data: DataFormat,
    options: ChartOptions
): ChartDataItem[] {
    const { type, range } = options
    const records = getCompleteRecordsForRange(data.values, range)

    if (records.length === 0) {
        return []
    }

    const first = data.values[0]

    if (!isCompleteRecord(first)) {
        throw new Error('Oczekiwano pełnych danych w pierwszym rekordzie')
    }

    const result = records.map((item, index) => {
        const previousItem: RangeCompleteValuesRecord | null =
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
            let from: CompleteValuesRecord | null = null

            if (type === ChartType.Bar) {
                if (previousItem && previousItem.values) {
                    from = previousItem.values
                }
            } else {
                from = first
            }

            if (from) {
                const { totalConsumption } = calculateEnergy({
                    from,
                    to: item.values,
                    plantProperties: data.plantProperties,
                })

                value = totalConsumption
            }
        }

        return {
            x: label,
            y: value,
        }
    })

    // dla wykresu kolumnowego pierwszy rekord nie zawiera danych, usuń go
    if (type === ChartType.Bar) {
        result.shift()
    }

    return result
}
