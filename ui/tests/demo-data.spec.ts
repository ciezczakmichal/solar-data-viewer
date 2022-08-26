import { readFile } from 'fs/promises'
import { convertObjectToSolarDataFormat, SolarDataFormat } from 'schema'

async function getData(): Promise<Record<string, any>> {
    const json = await readFile(
        new URL('../public/demo-data.json', import.meta.url),
        'utf8'
    )
    return JSON.parse(json)
}

it('plik demo-data.json zawiera dane zgodne z formatem', async () => {
    const result = await convertObjectToSolarDataFormat(await getData())
    expect(result).toBeInstanceOf(SolarDataFormat)
})
