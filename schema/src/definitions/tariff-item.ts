export interface TariffItemValue {
    from: string

    // wartość netto - bez podatku
    value: number

    comment?: string
}

export interface TariffItem {
    name: string
    values: TariffItemValue[]
}
