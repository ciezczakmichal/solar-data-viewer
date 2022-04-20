import { IsNumber, IsOptional, IsString } from 'class-validator'
import { IsISO8601Date } from '../decorators/is-iso8601-date'

export class MeterRecord {
    @IsISO8601Date()
    date!: string

    // energia pobrana z sieci
    @IsNumber()
    charged!: number

    // energia oddana do sieci
    @IsNumber()
    donated!: number

    @IsOptional()
    @IsString()
    comment!: string | null | undefined
}
