import { parseDate } from 'calculation'
import dayjs from 'dayjs'

const locale = 'pl-PL'

const numberFormat = new Intl.NumberFormat(locale, {
    style: 'decimal',
    maximumFractionDigits: 2,
})

const percentFormat = new Intl.NumberFormat(locale, {
    style: 'percent',
    maximumFractionDigits: 2,
})

const yearFormat = new Intl.NumberFormat(locale, {
    style: 'unit',
    unit: 'year',
    unitDisplay: 'long',
})

const monthFormat = new Intl.NumberFormat(locale, {
    style: 'unit',
    unit: 'month',
    unitDisplay: 'long',
})

export function formatNumber(value: number): string {
    return numberFormat.format(value)
}

export function formatKwh(value: number): string {
    return numberFormat.format(value) + ' kWh'
}

export function formatPercent(value: number): string {
    return percentFormat.format(value)
}

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

export function formatDuration(
    days: number,
    flag = DurationFormatFlag.None
): string {
    const duration = dayjs.duration(days, 'days')

    const values = [
        duration.years(),
        duration.months(),
        flag === DurationFormatFlag.OmitDays ? 0 : duration.days(),
    ]
    const formaters = [yearFormat.format, monthFormat.format, formatDays]

    const parts = values
        .map((value, index) => (value > 0 ? formaters[index](value) : ''))
        .filter(text => text !== '')

    return parts.join(', ')
}
