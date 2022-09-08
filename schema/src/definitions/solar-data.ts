import {
    ArrayMinSize,
    Equals,
    IsArray,
    IsInstance,
    IsOptional,
    ValidateNested,
} from 'class-validator'
import { Type } from 'class-transformer'
import { MeterRecord } from './meter-record'
import { ValuesRecord, ValuesRecordValidationClass } from './values-record'
import { PlantProperties } from './plant-properties'
import { YieldForecastRecord } from './yield-forecast-record'
import { TariffItem } from './tariff-item'
import { VatRateItem } from './vat-rate-item'

export const SolarDataVersion = 9

export class SolarData {
    @Equals(SolarDataVersion)
    version!: typeof SolarDataVersion

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

    @IsInstance(PlantProperties)
    @ValidateNested()
    @Type(() => PlantProperties)
    plantProperties!: PlantProperties

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => YieldForecastRecord)
    yieldForecastData?: YieldForecastRecord[]

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => TariffItem)
    tariff!: TariffItem[]

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => VatRateItem)
    vatRate!: VatRateItem[]
}
