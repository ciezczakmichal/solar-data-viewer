import type { Dayjs } from 'dayjs'
import {
    isCompleteRecord,
    isYieldRecord,
    type BaseValuesRecord,
    type CompleteValuesRecord,
    type MeterValuesRecord,
    type ValuesRecord,
    type YieldValuesRecord,
} from 'format'
import { parseDate } from 'calculation'
import { isLastDayOfMonth, getLastDayOfMonth } from './date'

export enum DataRange {
    Week,
    Month,
}

export interface RangeValuesRecord<T extends BaseValuesRecord = ValuesRecord> {
    date: Dayjs
    values: T | null
}

export type RangeYieldValuesRecord = RangeValuesRecord<YieldValuesRecord>
export type RangeMeterValuesRecord = RangeValuesRecord<MeterValuesRecord>
export type RangeCompleteValuesRecord = RangeValuesRecord<CompleteValuesRecord>

export function getRecordsForRange(
    values: ValuesRecord[],
    range: DataRange
): RangeValuesRecord[] {
    let presentValues: RangeValuesRecord[] = values.map(item => ({
        date: parseDate(item.date),
        values: item,
    }))
    let getNextDateCallback: (date: Dayjs) => Dayjs

    if (range === DataRange.Week) {
        presentValues = presentValues.filter(item => {
            // dane z niedzieli
            return item.date.day() === 0
        })
        getNextDateCallback = date => date.add(7, 'day')
    } else {
        presentValues = presentValues.filter((item, index, array) => {
            // dane z ostatniego dnia miesiąca, pierwszy lub ostatni dzień pomiarowy
            const first = index === 0
            const last = index + 1 >= array.length

            return first || last || isLastDayOfMonth(item.date)
        })
        getNextDateCallback = current => {
            // obecna data może być początkiem danych (być w środku miesiąca)
            if (!isLastDayOfMonth(current)) {
                return getLastDayOfMonth(current)
            }

            const value = current.date(1).add(1, 'month') // 1. dzień następnego miesiąca
            return getLastDayOfMonth(value)
        }
    }

    let result: RangeValuesRecord[] = []
    let nextDate: Dayjs | null = null

    for (const value of presentValues) {
        if (nextDate) {
            while (nextDate.isBefore(value.date, 'day')) {
                result.push({
                    date: nextDate,
                    values: null,
                })
                nextDate = getNextDateCallback(nextDate)
            }
        }

        result.push(value)
        nextDate = getNextDateCallback(value.date)
    }

    return result
}

export function getYieldRecordsForRange(
    values: ValuesRecord[],
    range: DataRange
): RangeYieldValuesRecord[] {
    const records = values.filter(isYieldRecord)
    return getRecordsForRange(records, range) as RangeYieldValuesRecord[]
}

export function getCompleteRecordsForRange(
    values: ValuesRecord[],
    range: DataRange
): RangeCompleteValuesRecord[] {
    const records = values.filter(isCompleteRecord)
    return getRecordsForRange(records, range) as RangeCompleteValuesRecord[]
}
