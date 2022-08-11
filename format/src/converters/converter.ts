import { SolarDataFormat } from '../definitions/solar-data-format'
import { convertPlainObjectToInstance } from './generics'

export function convertObjectToSolarDataFormat(
    data: any
): Promise<SolarDataFormat> {
    return convertPlainObjectToInstance(
        SolarDataFormat,
        data,
        error =>
            new Error(
                'Dane nie są zgodne ze strukturą wymaganą przez aplikację. Błędy: ' +
                    error
            )
    )
}
