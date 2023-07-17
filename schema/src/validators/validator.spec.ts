import { readFile } from 'fs/promises'
import { basename } from 'path'
import { InvalidSolarDataSchemaError } from '../error'
import { validateSolarData } from './validator'

const smallestDataPath = './tests/example-smallest-data.json'

async function getExampleSmallestData(): Promise<Record<string, any>> {
    const json = await readFile(
        new URL(smallestDataPath, import.meta.url),
        'utf8'
    )
    return JSON.parse(json)
}

describe('validateSolarData', () => {
    function testThrowsErrorWithValue(value: any): Promise<void> {
        return expect(() => validateSolarData(value)).rejects.toThrow(
            InvalidSolarDataSchemaError
        )
    }

    describe('testy błędnych, prostych wartości', () => {
        it('null nie jest poprawnym formatem danych', async () => {
            await testThrowsErrorWithValue(null)
        })

        it('undefined nie jest poprawnym formatem danych', async () => {
            await testThrowsErrorWithValue(undefined)
        })

        it('boolean nie jest poprawnym formatem danych', async () => {
            await testThrowsErrorWithValue(false)
            await testThrowsErrorWithValue(true)
        })

        it('liczba nie jest poprawnym formatem danych', async () => {
            await testThrowsErrorWithValue(0)
            await testThrowsErrorWithValue(1.23)
        })

        it('string nie jest poprawnym formatem danych', async () => {
            await testThrowsErrorWithValue('')
            await testThrowsErrorWithValue(' ')
            await testThrowsErrorWithValue('test')
        })

        it('tablica nie jest poprawnym formatem danych', async () => {
            await testThrowsErrorWithValue([])
        })

        it('pusty obiekt nie jest poprawnym formatem danych', async () => {
            await testThrowsErrorWithValue({})
        })
    })

    describe(`testy na pliku z minimalną ilością danych (${basename(
        smallestDataPath
    )})`, () => {
        let data: Record<string, any>

        beforeEach(async () => {
            data = await getExampleSmallestData()
        })

        it('przykładowy plik z minimalną ilością danych jest traktowany jako poprawny', async () => {
            await validateSolarData(data)
        })

        it('usunięcie dowolnej właściwości z minimalnych danych skutkuje odrzuceniem danych', async () => {
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
