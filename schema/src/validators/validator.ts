import { DefinedError, ValidateFunction } from 'ajv'
import localize_pl from 'ajv-i18n/localize/pl'
import { SolarData, SolarDataSchema } from '../definitions/solar-data'
import { ValuesRecord } from '../definitions/values-record'
import { InvalidSolarDataSchemaError } from '../error'
import { parseDate } from '../utils/date'
import { validate as validate_ } from './validator-standalone'

/* Wersja wymagająca kompilacji schemy w runtime */
// const ajv = new Ajv()
// const validate = ajv.compile(SolarDataSchema)

/* Wersja używająca skompilowaną wersję funkcji walidującej w runtime */

const validate = validate_ as ValidateFunction<SolarDataSchema>

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
