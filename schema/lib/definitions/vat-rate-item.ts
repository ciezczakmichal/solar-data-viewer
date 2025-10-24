import type { Dayjs } from 'dayjs'

export interface VatRateItemSchema {
    from: string

    // stawka VAT, np. 23
    value: number

    comment?: string
}

export interface VatRateItem extends Omit<VatRateItemSchema, 'from'> {
    from: Dayjs
}
