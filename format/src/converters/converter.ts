import { DataFormat } from '../definitions/data-format'
import { convertPlainObjectToInstance } from './generics'

export function convertObjectToDataFormat(data: object): Promise<DataFormat> {
    return convertPlainObjectToInstance(
        DataFormat,
        data,
        error =>
            new Error(
                'Dane nie są zgodne ze strukturą wymaganą przez aplikację. Błędy: ' +
                    error
            )
    )
}
