import { Locale } from './locale'

const numberFormat = new Intl.NumberFormat(Locale, {
    style: 'decimal',
    maximumFractionDigits: 2,
})

const percentFormat = new Intl.NumberFormat(Locale, {
    style: 'percent',
    maximumFractionDigits: 2,
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
