import { IsInt, IsOptional, IsString } from 'class-validator'
import { IsISO8601Date } from '../decorators/is-iso8601-date'

export class VatRateItem {
    @IsISO8601Date()
    from!: string

    // stawka VAT, np. 23
    @IsInt()
    value!: number

    @IsOptional()
    @IsString()
    comment?: string
}
