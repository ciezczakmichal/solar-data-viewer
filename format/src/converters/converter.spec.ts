// wymagane przez class-transformer
import 'reflect-metadata'

import { convertObjectToDataFormat } from './converter'

describe('convertObjectToDataFormat', () => {
    function testValueThrowsError(value: any): Promise<void> {
        return expect(() =>
            convertObjectToDataFormat(value)
        ).rejects.toThrowError()
    }

    it('null nie jest poprawnym formatem danych', async () => {
        await testValueThrowsError(null)
    })

    it('undefined nie jest poprawnym formatem danych', async () => {
        await testValueThrowsError(undefined)
    })

    it('boolean nie jest poprawnym formatem danych', async () => {
        await testValueThrowsError(false)
        await testValueThrowsError(true)
    })

    it('liczba nie jest poprawnym formatem danych', async () => {
        await testValueThrowsError(0)
        await testValueThrowsError(1.23)
    })

    it('string nie jest poprawnym formatem danych', async () => {
        await testValueThrowsError('')
        await testValueThrowsError(' ')
        await testValueThrowsError('test')
    })

    it('tablica nie jest poprawnym formatem danych', async () => {
        await testValueThrowsError([])
    })

    it('pusty obiekt nie jest poprawnym formatem danych', async () => {
        await testValueThrowsError({})
    })
})
