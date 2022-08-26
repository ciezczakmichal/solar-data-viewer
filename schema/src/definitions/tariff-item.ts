import {
    IsArray,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    ValidateNested,
} from 'class-validator'
import { Type } from 'class-transformer'
import { IsISO8601Date } from '../decorators/is-iso8601-date'

export class TariffItemValue {
    @IsISO8601Date()
    from!: string

    // wartość netto - bez podatku
    @IsNumber()
    value!: number

    @IsOptional()
    @IsString()
    comment?: string
}

export class TariffItem {
    @IsString()
    @IsNotEmpty()
    name!: string

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => TariffItemValue)
    values!: TariffItemValue[]
}
