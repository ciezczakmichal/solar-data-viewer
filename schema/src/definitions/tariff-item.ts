export enum UnitOfMeasure {
    kWh = 'kWh',
    zlMies = 'zlMies',
}

export interface TariffItemValue {
    from: string

    // wartość netto - bez podatku
    value: number

    comment?: string
}

export interface TariffItem {
    name: string
    unitOfMeasure: UnitOfMeasure
    values: TariffItemValue[]
}
