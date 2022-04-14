import { Equals, IsArray, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'
import { EnergyProducedInfo } from './energy-produced-info'
import { MeterInfo } from './meter-info'
import { PlantProperties } from './plant-properties'
import { TariffItem } from './tariff-item'

export class DataFormat {
    @Equals('v2')
    version!: 'v2'

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => EnergyProducedInfo)
    energyProduced!: EnergyProducedInfo[]

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => MeterInfo)
    meter!: MeterInfo[]

    @ValidateNested()
    @Type(() => PlantProperties)
    plantProperties!: PlantProperties

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => TariffItem)
    tariff!: TariffItem[]
}
