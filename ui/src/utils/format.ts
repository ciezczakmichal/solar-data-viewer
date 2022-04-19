const numberFormat = new Intl.NumberFormat('pl-PL', {
    style: 'decimal',
    maximumFractionDigits: 2,
})

export function formatNumber(value: number): string {
    return numberFormat.format(value)
}

export function formatKwh(value: number): string {
    return numberFormat.format(value) + ' kWh'
}
