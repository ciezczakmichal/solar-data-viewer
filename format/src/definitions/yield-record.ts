import { IsNumber, IsOptional, IsString } from 'class-validator'
import { IsISO8601Date } from '../decorators/is-iso8601-date'

export class YieldRecord {
    @IsISO8601Date()
    date!: string

    @IsNumber()
    value!: number

    @IsOptional()
    @IsString()
    comment!: string | null | undefined
}
