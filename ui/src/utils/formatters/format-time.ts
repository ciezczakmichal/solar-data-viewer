import dayjs from 'dayjs'
import { parseDate } from 'calculation'
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

export function formatDate(value: string): string {
    const date = parseDate(value)
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

export interface Duration {
    from: string
    to: string
}

export function formatDuration(days: number, flag?: DurationFormatFlag): string
export function formatDuration(
    duration: Duration,
    flag?: DurationFormatFlag
): string
export function formatDuration(
    input: number | Duration,
    flag = DurationFormatFlag.None
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

function getValuesForDuration(duration: Duration): number[] {
    const from = parseDate(duration.from)
    const to = parseDate(duration.to)

    let months = to.month() - from.month()

    if (months < 0) {
        months = 12 - from.month() + to.month()
    }

    // niepełny miesiąc
    if (to.date() < from.date()) {
        months--
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
