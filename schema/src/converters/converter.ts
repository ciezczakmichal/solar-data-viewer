import { SolarDataFormat } from '../definitions/solar-data-format'
import { InvalidSolarDataSchemaError } from '../error'
import { convertPlainObjectToInstance } from './generics'

export function convertObjectToSolarDataFormat(
    data: any
): Promise<SolarDataFormat> {
    return convertPlainObjectToInstance(
        SolarDataFormat,
        data,
        error =>
            new InvalidSolarDataSchemaError(
                'Dane nie są zgodne ze strukturą wymaganą przez aplikację. Błędy: ' +
                    error
            )
    )
}
