import { ArrayMinSize, Equals, IsArray, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'
import { MeterRecord } from './meter-record'
import { ValuesRecord, ValuesRecordValidationClass } from './values-record'
import { PlantProperties } from './plant-properties'
import { YieldForecastRecord } from './yield-forecast-record'
import { TariffItem } from './tariff-item'
import { VatRateItem } from './vat-rate-item'

export class DataFormat {
    @Equals(8)
    version!: 8

    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({ each: true })
    @Type(() => MeterRecord)
    meters!: MeterRecord[]

    @IsArray()
    @ArrayMinSize(1)
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
