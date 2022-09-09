import { DefinedError, ValidateFunction } from 'ajv'
import localize_pl from 'ajv-i18n/localize/pl'
import { SolarData } from '../definitions/solar-data'
import { InvalidSolarDataSchemaError } from '../error'
import { validate as validate_ } from './validator-standalone'

/* Wersja wymagająca kompilacji schemy w runtime */
// const ajv = new Ajv()
// const validate = ajv.compile(SolarDataSchema)

/* Wersja używająca skompilowaną wersję funkcji walidującej w runtime */

const validate = validate_ as ValidateFunction<SolarData>

export async function validateSolarData(data: any): Promise<SolarData> {
    if (!validate(data)) {
        const errors = validate.errors as DefinedError[]
        localize_pl(errors)
        throw new InvalidSolarDataSchemaError(errors)
    }

    return data
}
