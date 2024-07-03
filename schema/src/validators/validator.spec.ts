import { readFile } from 'fs/promises'
import { basename } from 'path'
import { beforeEach, describe, expect, test } from 'vitest'
import { InvalidSolarDataSchemaError } from '../error.js'
import { validateSolarData } from './validator.js'

const smallestDataPath = './tests/example-smallest-data.json'

async function getExampleSmallestData(): Promise<Record<string, any>> {
    const json = await readFile(
        new URL(smallestDataPath, import.meta.url),
        'utf8',
    )
    return JSON.parse(json) as Record<string, any>
}

describe('validateSolarData', () => {
    function testThrowsErrorWithValue(value: any): Promise<void> {
        return expect(() => validateSolarData(value)).rejects.toThrow(
            InvalidSolarDataSchemaError,
        )
    }

    describe('testy błędnych, prostych wartości', () => {
        test('null nie jest poprawnym formatem danych', async () => {
            await testThrowsErrorWithValue(null)
        })

        test('undefined nie jest poprawnym formatem danych', async () => {
            await testThrowsErrorWithValue(undefined)
        })

        test('boolean nie jest poprawnym formatem danych', async () => {
            await testThrowsErrorWithValue(false)
            await testThrowsErrorWithValue(true)
        })

        test('liczba nie jest poprawnym formatem danych', async () => {
            await testThrowsErrorWithValue(0)
            await testThrowsErrorWithValue(1.23)
        })

        test('string nie jest poprawnym formatem danych', async () => {
            await testThrowsErrorWithValue('')
            await testThrowsErrorWithValue(' ')
            await testThrowsErrorWithValue('test')
        })

        test('tablica nie jest poprawnym formatem danych', async () => {
            await testThrowsErrorWithValue([])
        })

        test('pusty obiekt nie jest poprawnym formatem danych', async () => {
            await testThrowsErrorWithValue({})
        })
    })

    describe(`testy na pliku z minimalną ilością danych (${basename(
        smallestDataPath,
    )})`, () => {
        let data: Record<string, any>

        beforeEach(async () => {
            data = await getExampleSmallestData()
        })

        test('przykładowy plik z minimalną ilością danych jest traktowany jako poprawny', async () => {
            await validateSolarData(data)
        })

        test('usunięcie dowolnej właściwości z minimalnych danych skutkuje odrzuceniem danych', async () => {
            for (const property in data) {
                if (Object.prototype.hasOwnProperty.call(data, property)) {
                    const changedData = await getExampleSmallestData()
                    delete changedData[property]

                    await testThrowsErrorWithValue(changedData)
                }
            }
        })
    })
})
