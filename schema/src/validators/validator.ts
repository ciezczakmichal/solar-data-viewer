import type { DefinedError, ValidateFunction } from 'ajv'
// konieczne obejścia z powodu błędu https://github.com/ajv-validator/ajv/issues/2132
import Localize_plModule from 'ajv-i18n/localize/pl'
const localize_pl = Localize_plModule as unknown as (data: any) => void

import type { SolarData, SolarDataSchema } from '../definitions/solar-data.js'
import type { ValuesRecord } from '../definitions/values-record.js'
import { InvalidSolarDataSchemaError } from '../error.js'
import { validate as validate_ } from '../generated/validator-standalone.js'
import { parseDate } from '../utils/date.js'

/* Wersja wymagająca kompilacji schemy w runtime */
// const ajv = new Ajv()
// const validate = ajv.compile(SolarDataSchema)

/* Wersja używająca skompilowaną wersję funkcji walidującej w runtime */

const validate = validate_ as ValidateFunction<SolarDataSchema>

// eslint-disable-next-line @typescript-eslint/require-await
export async function validateSolarData(data: any): Promise<SolarData> {
    if (!validate(data)) {
        const errors = validate.errors as DefinedError[]
        localize_pl(errors)
        throw new InvalidSolarDataSchemaError(errors)
    }

    const {
        version,
        messages,
        meters,
        values,
        plantProperties,
        yieldForecast,
        tariff,
        vatRates,
    } = data

    return {
        version,
        messages,
        meters: meters.map(meter => ({
            ...meter,
            installationDate: parseDate(meter.installationDate),
        })),
        values: values.map(
            value =>
                ({
                    ...value,
                    date: parseDate(value.date),
                }) as ValuesRecord,
        ),
        plantProperties,
        yieldForecast,
        tariff: tariff.map(item => ({
            ...item,
            values: item.values.map(value => ({
                ...value,
                from: parseDate(value.from),
            })),
        })),
        vatRates: vatRates.map(item => ({
            ...item,
            from: parseDate(item.from),
        })),
    }
}
