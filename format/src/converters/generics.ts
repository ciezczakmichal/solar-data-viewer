import {
    ClassConstructor,
    ClassTransformOptions,
    plainToInstance,
} from 'class-transformer'
import { validateOrReject } from 'class-validator'

export async function convertPlainObjectToInstance<T>(
    cls: ClassConstructor<T>,
    plain: object,
    errorCreator: (error: any) => Error,
    options?: ClassTransformOptions
): Promise<T> {
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
