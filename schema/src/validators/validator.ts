import Ajv, { DefinedError } from 'ajv'
import { SolarData } from '../definitions/solar-data'
import { SolarDataSchema } from '../definitions/solar-data-schema'
import { InvalidSolarDataSchemaError } from '../error'

const ajv = new Ajv()
const validate = ajv.compile(SolarDataSchema)

export async function validateSolarData(data: any): Promise<SolarData> {
    if (!validate(data)) {
        throw new InvalidSolarDataSchemaError(validate.errors as DefinedError[])
    }

    return data
}
