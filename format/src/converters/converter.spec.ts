// wymagane przez class-transformer
import 'reflect-metadata'

import { readFile } from 'fs/promises'
import { DataFormat } from '../definitions/data-format'
import { convertObjectToDataFormat } from './converter'

describe('convertObjectToDataFormat', () => {
    describe('testy błędnych, prostych wartości', () => {
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

    it('przykładowy plik z minimalną liczbą danych jest traktowany jako poprawny', async () => {
        const json = await readFile(
            new URL('./tests/example-smallest-data.json', import.meta.url),
            'utf8'
        )
        const data = JSON.parse(json)

        const result = await convertObjectToDataFormat(data)
        expect(result).toBeInstanceOf(DataFormat)
    })
})
