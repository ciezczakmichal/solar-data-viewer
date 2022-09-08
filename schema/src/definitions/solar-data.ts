import { MeterRecord } from './meter-record'
import { ValuesRecord } from './values-record'
import { PlantProperties } from './plant-properties'
import { YieldForecastRecord } from './yield-forecast-record'
import { TariffItem } from './tariff-item'
import { VatRateItem } from './vat-rate-item'

export const SolarDataVersion = 9

export interface SolarData {
    version: typeof SolarDataVersion
    meters: MeterRecord[]
    values: ValuesRecord[]
    plantProperties: PlantProperties
    yieldForecastData?: YieldForecastRecord[]
    tariff: TariffItem[]
    vatRate: VatRateItem[]
}
