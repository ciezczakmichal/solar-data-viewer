import { parseDate } from 'calculation'

const numberFormat = new Intl.NumberFormat('pl-PL', {
    style: 'decimal',
    maximumFractionDigits: 2,
})

const percentFormat = new Intl.NumberFormat('pl-PL', {
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

export function formatDate(value: string): string {
    const date = parseDate(value)
    return date.format('L')
}
