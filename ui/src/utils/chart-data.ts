import {
    isCompleteRecord,
    isYieldRecord,
    type CompleteValuesRecord,
    type ValuesRecord,
    type YieldValuesRecord,
} from 'format'
import { parseDate } from 'calculation'

export enum DataRange {
    Week,
    Month,
}

export function getRecordsForRange(
    values: ValuesRecord[],
    range: DataRange
): ValuesRecord[] {
    if (range === DataRange.Week) {
        return values.filter(item => {
            // dane z niedzieli
            const date = parseDate(item.date)
            return date.day() === 0
        })
    } else {
        return values.filter((item, index, array) => {
            // dane z ostatniego dnia miesiąca lub ostatni dzień pomiarowy
            const date = parseDate(item.date)
            const lastMonth = index + 1 >= array.length
            return date.date() === date.daysInMonth() || lastMonth
        })
    }
}

export function getYieldRecordsForRange(
    values: ValuesRecord[],
    range: DataRange
): YieldValuesRecord[] {
    const records = getRecordsForRange(values, range)
    return records.filter(isYieldRecord) as YieldValuesRecord[]
}

export function getCompleteRecordsForRange(
    values: ValuesRecord[],
    range: DataRange
): CompleteValuesRecord[] {
    const records = getRecordsForRange(values, range)
    return records.filter(isCompleteRecord) as CompleteValuesRecord[]
}
