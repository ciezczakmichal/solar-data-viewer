import type { Dayjs } from 'dayjs'
import type { ValuesRecord, ValuesRecordProperties } from 'schema'
import { parseDate } from 'calculation'
import { DataRange, type RangeValuesRecord } from './records-for-range'
import { getMonthDisplayText } from '../utils/date'

export enum ChartType {
    Line,
    Bar,
}

export interface ChartOptions {
    type: ChartType
    range: DataRange
}

export interface ChartDataItem {
    // label, opis wartości (na osi X)
    x: string

    // value, wartość (na osi Y)
    y: number | null
}

export interface ChartDataItemWithDate extends ChartDataItem {
    // wskazanie daty, z której wygenerowano opis wartości (label)
    date: Dayjs
}

export type ChartValueCalculationFunction<
    T extends ValuesRecordProperties = ValuesRecord
> = (from: T, to: T) => number | null

function getLineChartData<T extends ValuesRecordProperties = ValuesRecord>(
    from: T,
    records: RangeValuesRecord<T>[],
    range: DataRange,
    calculationFn: ChartValueCalculationFunction<T>
): ChartDataItemWithDate[] {
    return records.map(item => {
        let x = ''

        if (range === DataRange.Week) {
            x = item.date.format('DD.MM')
        } else {
            x = getMonthDisplayText(item.date)
        }

        let y = null

        if (item.values) {
            y = calculationFn(from, item.values)
        }

        return { x, y, date: item.date }
    })
}

function getBarChartData<T extends ValuesRecordProperties = ValuesRecord>(
    from: T,
    records: RangeValuesRecord<T>[],
    range: DataRange,
    calculationFn: ChartValueCalculationFunction<T>
): ChartDataItemWithDate[] {
    const firstItem: RangeValuesRecord<T> = {
        date: parseDate(from.date),
        values: from,
    }

    const result = records.map((item, index) => {
        const previousItem: RangeValuesRecord<T> =
            index > 0 ? records[index - 1] : firstItem
        let x = ''

        if (range === DataRange.Week) {
            const currentLabel = item.date.format('DD.MM')
            const previousLabel = previousItem.date
                .add(1, 'day')
                .format('DD.MM')
            x = `${previousLabel} - ${currentLabel}`
        } else {
            x = getMonthDisplayText(item.date)
        }

        let y = null

        if (item.values && previousItem.values) {
            y = calculationFn(previousItem.values, item.values)
        }

        return { x, y, date: item.date }
    })

    // nie wyświetlaj danych dla okresu from - records[0]
    if (range === DataRange.Week) {
        result.shift()
    }

    return result
}

export function getChartData<T extends ValuesRecordProperties = ValuesRecord>(
    from: T,
    records: RangeValuesRecord<T>[],
    options: ChartOptions,
    calculationFn: ChartValueCalculationFunction<T>
): ChartDataItemWithDate[] {
    const { type, range } = options

    if (type === ChartType.Line) {
        return getLineChartData(from, records, range, calculationFn)
    }

    return getBarChartData(from, records, range, calculationFn)
}
