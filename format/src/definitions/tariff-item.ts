import { IsNotEmpty, IsNumber, IsString } from 'class-validator'

export class TariffItem {
    @IsString()
    @IsNotEmpty()
    name!: string

    // czyli bez podatku
    @IsNumber()
    factorNetto!: number
}
