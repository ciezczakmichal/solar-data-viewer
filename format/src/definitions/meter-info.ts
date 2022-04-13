import { IsISO8601, IsNumber, IsOptional, IsString } from 'class-validator'

export class MeterInfo {
    @IsISO8601({ strict: true })
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
