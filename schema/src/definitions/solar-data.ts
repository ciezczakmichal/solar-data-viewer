import { Message } from './message'
import { MeterRecord, MeterRecordSchema } from './meter-record'
import { PlantProperties } from './plant-properties'
import { TariffItem, TariffItemSchema } from './tariff-item'
import { ValuesRecord, ValuesRecordSchema } from './values-record'
import { VatRateItem, VatRateItemSchema } from './vat-rate-item'
import { YieldForecastRecord } from './yield-forecast-record'

export const SolarDataVersion = 12

/**
 * Postać struktury na wejściu do funkcji walidującej.
 */
export interface SolarDataSchema {
    version: typeof SolarDataVersion
    messages?: Message[]
    meters: MeterRecordSchema[]
    values: ValuesRecordSchema[]
    plantProperties: PlantProperties
    yieldForecast?: YieldForecastRecord[]
    tariff: TariffItemSchema[]
    vatRates: VatRateItemSchema[]
}

/**
 * Postać struktury na wyjściu funkcji walidującej.
 */
export interface SolarData {
    version: typeof SolarDataVersion
    messages?: Message[]
    meters: MeterRecord[]
    values: ValuesRecord[]
    plantProperties: PlantProperties
    yieldForecast?: YieldForecastRecord[]
    tariff: TariffItem[]
    vatRates: VatRateItem[]
}
