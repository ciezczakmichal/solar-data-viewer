import { readFile } from 'fs/promises'
import { InvalidSolarDataSchemaError } from '../error'
import { validateSolarData } from './validator'

async function getExampleSmallestData(): Promise<Record<string, any>> {
    const json = await readFile(
        new URL('./tests/example-smallest-data.json', import.meta.url),
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

    describe('testy na pliku z minimalną liczbą danych', () => {
        let data: Record<string, any>

        beforeEach(async () => {
            data = await getExampleSmallestData()
        })

        it('przykładowy plik z minimalną liczbą danych jest traktowany jako poprawny', async () => {
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
