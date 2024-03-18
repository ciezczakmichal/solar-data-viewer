import { Message } from './message.js'
import { MeterRecord, MeterRecordSchema } from './meter-record.js'
import { PlantProperties } from './plant-properties.js'
import { TariffItem, TariffItemSchema } from './tariff-item.js'
import { ValuesRecord, ValuesRecordSchema } from './values-record.js'
import { VatRateItem, VatRateItemSchema } from './vat-rate-item.js'
import { YieldForecastRecord } from './yield-forecast-record.js'

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
