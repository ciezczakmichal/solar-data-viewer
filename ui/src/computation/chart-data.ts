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

export interface ChartDataItemXAxis {
    // label, opis wartości (na osi X)
    x: string
}

export interface ChartDataItemYAxis {
    // value, wartość (na osi Y)
    y: number | null
}

export type ChartDataItem = ChartDataItemXAxis & ChartDataItemYAxis

export type ChartData<ReturnType extends Record<string, any>> =
    (ChartDataItemXAxis & ReturnType)[]

export interface ChartValueCalculationFunctionInput<
    ValuesRecordType extends ValuesRecordProperties
> {
    from: ValuesRecordType
    to: ValuesRecordType

    label: string
    date: Dayjs
}

export type ChartValueCalculationFunction<
    ReturnType extends Record<string, any>,
    ValuesRecordType extends ValuesRecordProperties
> = (input: ChartValueCalculationFunctionInput<ValuesRecordType>) => ReturnType

function getLineChartData<
    ReturnType extends Record<string, any>,
    ValuesRecordType extends ValuesRecordProperties
>(
    from: ValuesRecordType,
    records: RangeValuesRecord<ValuesRecordType>[],
    range: DataRange,
    calculationFn: ChartValueCalculationFunction<ReturnType, ValuesRecordType>
): ChartData<ReturnType> {
    return records.map(item => {
        let x = ''

        if (range === DataRange.Week) {
            x = item.date.format('DD.MM')
        } else {
            x = getMonthDisplayText(item.date)
        }

        let result: ReturnType = {} as ReturnType

        if (item.values) {
            result = calculationFn({
                from,
                to: item.values,
                label: x,
                date: item.date,
            })
        }

        return { x, ...result }
    })
}

function getBarChartData<
    ReturnType extends Record<string, any>,
    ValuesRecordType extends ValuesRecordProperties
>(
    from: ValuesRecordType,
    records: RangeValuesRecord<ValuesRecordType>[],
    range: DataRange,
    calculationFn: ChartValueCalculationFunction<ReturnType, ValuesRecordType>
): ChartData<ReturnType> {
    const firstItem: RangeValuesRecord<ValuesRecordType> = {
        date: parseDate(from.date),
        values: from,
    }

    const result = records.map((item, index) => {
        const previousItem: RangeValuesRecord<ValuesRecordType> =
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

        let result: ReturnType = {} as ReturnType

        if (item.values && previousItem.values) {
            result = calculationFn({
                from: previousItem.values,
                to: item.values,
                label: x,
                date: item.date,
            })
        }

        return { x, ...result }
    })

    // nie wyświetlaj danych dla okresu from - records[0]
    if (range === DataRange.Week) {
        result.shift()
    }

    return result
}

export function getChartData<
    ReturnType extends Record<string, any>,
    ValuesRecordType extends ValuesRecordProperties = ValuesRecord
>(
    from: ValuesRecordType,
    records: RangeValuesRecord<ValuesRecordType>[],
    options: ChartOptions,
    calculationFn: ChartValueCalculationFunction<ReturnType, ValuesRecordType>
): ChartData<ReturnType> {
    const { type, range } = options

    if (type === ChartType.Line) {
        return getLineChartData(from, records, range, calculationFn)
    }

    return getBarChartData(from, records, range, calculationFn)
}
