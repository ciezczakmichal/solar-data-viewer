import { ArrayMinSize, Equals, IsArray, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'
import { ValuesRecord, ValuesRecordValidationClass } from './values-record'
import { PlantProperties } from './plant-properties'
import { YieldForecastRecord } from './yield-forecast-record'
import { TariffItem } from './tariff-item'

export class DataFormat {
    @Equals('v5')
    version!: 'v5'

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
}
