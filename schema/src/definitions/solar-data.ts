import type { Message } from './message.js'
import type { MeterRecord, MeterRecordSchema } from './meter-record.js'
import type { PlantProperties } from './plant-properties.js'
import type { TariffItem, TariffItemSchema } from './tariff-item.js'
import type { ValuesRecord, ValuesRecordSchema } from './values-record.js'
import type { VatRateItem, VatRateItemSchema } from './vat-rate-item.js'
import type { YieldForecastRecord } from './yield-forecast-record.js'

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
