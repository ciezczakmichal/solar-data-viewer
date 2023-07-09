import { Message } from './message'
import { MeterRecord } from './meter-record'
import { PlantProperties } from './plant-properties'
import { TariffItem } from './tariff-item'
import { ValuesRecord } from './values-record'
import { VatRateItem } from './vat-rate-item'
import { YieldForecastRecord } from './yield-forecast-record'

export const SolarDataVersion = 11

export interface SolarData {
    version: typeof SolarDataVersion
    messages?: Message[]
    meters: MeterRecord[]
    values: ValuesRecord[]
    plantProperties: PlantProperties
    yieldForecastData?: YieldForecastRecord[]
    tariff: TariffItem[]
    vatRate: VatRateItem[]
}
