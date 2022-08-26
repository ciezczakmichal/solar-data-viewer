import {
    ClassConstructor,
    ClassTransformOptions,
    plainToInstance,
} from 'class-transformer'
import { validateOrReject } from 'class-validator'

export async function convertPlainObjectToInstance<T>(
    cls: ClassConstructor<T>,
    plain: any,
    errorCreator: (error: any) => Error,
    options?: ClassTransformOptions
): Promise<T> {
    // plainToInstance() nie rzuci wyjątku, jeśli dane są tablicą, boolean lub liczbą
    if (typeof plain !== 'object' || Array.isArray(plain) || plain === null) {
        throw errorCreator('Główny element nie jest obiektem JSON')
    }

    const instance = plainToInstance(cls, plain, options)

    try {
        await validateOrReject(instance as unknown as object)
    } catch (error) {
        throw errorCreator(error)
    }

    return instance
}

export async function convertJsonStringToInstance<T>(
    cls: ClassConstructor<T>,
    json: string,
    errorCreator: (error: any) => Error,
    options?: ClassTransformOptions
): Promise<T> {
    const plain = JSON.parse(json)
    return convertPlainObjectToInstance(cls, plain, errorCreator, options)
}
