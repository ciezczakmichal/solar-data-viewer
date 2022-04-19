export function format(value: number): string {
    return value.toFixed(2)
}

const kwhFormat = new Intl.NumberFormat('pl-PL', {
    style: 'decimal',
})

export function formatKwh(value: number): string {
    return kwhFormat.format(value) + ' kWh'
}
