import type { BaseValuesRecord, ValuesRecord } from 'format'
import { parseDate } from 'calculation'
import { DataRange, type RangeValuesRecord } from './records-for-range'
import { getMonthName } from '../utils/date'

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

interface InternalChartDataItem {
    label: string
    value: number | null
}

export type ChartValueCalculationFunction<
    T extends BaseValuesRecord = ValuesRecord
> = (from: T, to: T) => number | null

function getLineChartData<T extends BaseValuesRecord = ValuesRecord>(
    from: T,
    records: RangeValuesRecord<T>[],
    range: DataRange,
    calculationFn: ChartValueCalculationFunction<T>
): InternalChartDataItem[] {
    return records.map(item => {
        let label = ''

        if (range === DataRange.Week) {
            label = item.date.format('DD.MM')
        } else {
            label = getMonthName(item.date.month())
        }

        let value = null

        if (item.values) {
            value = calculationFn(from, item.values)
        }

        return { label, value }
    })
}

function getBarChartData<T extends BaseValuesRecord = ValuesRecord>(
    from: T,
    records: RangeValuesRecord<T>[],
    range: DataRange,
    calculationFn: ChartValueCalculationFunction<T>
): InternalChartDataItem[] {
    const firstItem: RangeValuesRecord<T> = {
        date: parseDate(from.date),
        values: from,
    }

    const result = records.map((item, index) => {
        const previousItem: RangeValuesRecord<T> =
            index > 0 ? records[index - 1] : firstItem
        let label = ''

        if (range === DataRange.Week) {
            const currentLabel = item.date.format('DD.MM')
            const previousLabel = previousItem.date
                .add(1, 'day')
                .format('DD.MM')
            label = `${previousLabel} - ${currentLabel}`
        } else {
            label = getMonthName(item.date.month())
        }

        let value = null

        if (item.values && previousItem.values) {
            value = calculationFn(previousItem.values, item.values)
        }

        return { label, value }
    })

    // nie wyświetlaj danych dla okresu from - records[0]
    if (range === DataRange.Week) {
        result.shift()
    }

    return result
}

export function getChartData<T extends BaseValuesRecord = ValuesRecord>(
    from: T,
    records: RangeValuesRecord<T>[],
    options: ChartOptions,
    calculationFn: ChartValueCalculationFunction<T>
): ChartDataItem[] {
    const { type, range } = options

    let result: InternalChartDataItem[]

    if (type === ChartType.Line) {
        result = getLineChartData(from, records, range, calculationFn)
    } else {
        result = getBarChartData(from, records, range, calculationFn)
    }

    return result.map(({ label, value }) => ({ x: label, y: value }))
}
