import { IsInt, IsNumber } from 'class-validator'

export class YieldForecastRecord {
    @IsInt()
    month!: number

    @IsNumber()
    value!: number
}
