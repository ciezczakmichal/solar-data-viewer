import type { Dayjs } from 'dayjs'

export enum UnitOfMeasure {
    kWh = 'kWh',
    zlMies = 'zlMies',
}

/**
 * Wartość pozycji (parametr), ważna od zdefiniowanego czasu.
 */
export interface TariffItemValueSchema {
    from: string

    // wartość netto - bez podatku
    value: number

    comment?: string
}

/**
 * Wartość pozycji (parametr), ważna od zdefiniowanego czasu.
 */
export interface TariffItemValue extends Omit<TariffItemValueSchema, 'from'> {
    from: Dayjs
}

/**
 * Pozycja taryfowa na fakturze za energię.
 */
export interface TariffItemSchema {
    name: string
    unitOfMeasure: UnitOfMeasure
    values: TariffItemValueSchema[]
}

/**
 * Pozycja taryfowa na fakturze za energię.
 */
export interface TariffItem extends Omit<TariffItemSchema, 'values'> {
    values: TariffItemValue[]
}
