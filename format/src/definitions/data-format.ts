import { ArrayMinSize, Equals, IsArray, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'
import { ValuesRecord, ValuesRecordValidationClass } from './values-record'
import { PlantProperties } from './plant-properties'
import { YieldForecastRecord } from './yield-forecast-record'
import { TariffItem } from './tariff-item'
import { VatRateItem } from './vat-rate-item'

export class DataFormat {
    @Equals(7)
    version!: 7

    @IsArray()
    @ArrayMinSize(2)
    @ValidateNested({ each: true })
    @Type(() => ValuesRecordValidationClass)
    values!: ValuesRecord[]

    @ValidateNested()
    @Type(() => PlantProperties)
    plantProperties!: PlantProperties

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => YieldForecastRecord)
    yieldForecastData!: YieldForecastRecord[]

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => TariffItem)
    tariff!: TariffItem[]

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => VatRateItem)
    vatRate!: VatRateItem[]
}
