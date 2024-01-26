import type { DateRange } from 'calculation'
import dayjs, { type Dayjs } from 'dayjs'
import { Locale } from './locale'

const yearFormat = new Intl.NumberFormat(Locale, {
    style: 'unit',
    unit: 'year',
    unitDisplay: 'long',
})

const monthFormat = new Intl.NumberFormat(Locale, {
    style: 'unit',
    unit: 'month',
    unitDisplay: 'long',
})

export function formatDate(date: Dayjs): string {
    return date.format('L')
}

function formatDays(days: number): string {
    const word = days > 1 ? 'dni' : 'dzień'
    return `${days} ${word}`
}

export enum DurationFormatFlag {
    None,
    OmitDays,
}

export function formatDuration(days: number, flag?: DurationFormatFlag): string
export function formatDuration(
    duration: DateRange,
    flag?: DurationFormatFlag,
): string
export function formatDuration(
    input: number | DateRange,
    flag = DurationFormatFlag.None,
): string {
    let values: number[]

    if (typeof input === 'number') {
        values = getValuesForDays(input)
    } else {
        values = getValuesForDuration(input)
    }

    if (flag === DurationFormatFlag.OmitDays) {
        values[2] = 0 // liczba dni = 0
    }

    const formaters = [yearFormat.format, monthFormat.format, formatDays]
    const parts = values
        .map((value, index) => (value > 0 ? formaters[index](value) : ''))
        .filter(text => text !== '')

    return parts.join(', ')
}

function getValuesForDuration(duration: DateRange): number[] {
    const { from, to } = duration

    let months = to.month() - from.month()

    if (months < 0) {
        months = 12 - from.month() + to.month()
    }

    // niepełny miesiąc
    if (to.date() < from.date()) {
        months--
    }

    // ten sam miesiąc, ale niepełny = tylko kilka dni do pełnego roku
    if (months < 0) {
        months = 11
    }

    let days = to.date() - from.date()

    if (days < 0) {
        const daysInStartMonth = from.daysInMonth() - from.date()
        days = daysInStartMonth + to.date()
    }

    return [to.diff(from, 'year'), months, days]
}

function getValuesForDays(days: number): number[] {
    const duration = dayjs.duration(days, 'day')
    return [duration.years(), duration.months(), duration.days()]
}
