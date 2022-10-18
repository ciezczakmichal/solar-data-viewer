export enum UnitOfMeasure {
    kWh = 'kWh',
    zlMies = 'zlMies',
}

/**
 * Wartość pozycji (parametr), ważna od zdefiniowanego czasu.
 */
export interface TariffItemValue {
    from: string

    // wartość netto - bez podatku
    value: number

    comment?: string
}

/**
 * Pozycja taryfowa na fakturze za energię.
 */
export interface TariffItem {
    name: string
    unitOfMeasure: UnitOfMeasure
    values: TariffItemValue[]
}
