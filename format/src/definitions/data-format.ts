import { Equals, IsArray, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'
import { YieldRecord } from './yield-record'
import { MeterRecord } from './meter-record'
import { PlantProperties } from './plant-properties'
import { YieldForecastRecord } from './yield-forecast-record'
import { TariffItem } from './tariff-item'

export class DataFormat {
    @Equals('v4')
    version!: 'v4'

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => YieldRecord)
    yieldData!: YieldRecord[]

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => MeterRecord)
    meterData!: MeterRecord[]

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
