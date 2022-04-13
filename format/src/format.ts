import { IsString } from 'class-validator'

export class Test {
    @IsString()
    test!: boolean
}

export function validateDataFormat(_data: object): boolean {
    console.log('validateDataFormat działa')
    return true
}
