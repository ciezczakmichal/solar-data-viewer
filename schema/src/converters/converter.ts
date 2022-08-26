import { SolarData } from '../definitions/solar-data'
import { InvalidSolarDataSchemaError } from '../error'
import { convertPlainObjectToInstance } from './generics'

export function convertObjectToSolarData(data: any): Promise<SolarData> {
    return convertPlainObjectToInstance(
        SolarData,
        data,
        error =>
            new InvalidSolarDataSchemaError(
                'Dane nie są zgodne ze strukturą wymaganą przez aplikację. Błędy: ' +
                    error
            )
    )
}
