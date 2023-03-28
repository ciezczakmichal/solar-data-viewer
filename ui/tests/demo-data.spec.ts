import { readFile } from 'fs/promises'
import { validateSolarData } from 'schema'

async function getData(): Promise<Record<string, any>> {
    const json = await readFile(
        new URL('../static/demo-data.json', import.meta.url),
        'utf8'
    )
    return JSON.parse(json)
}

it('plik demo-data.json zawiera dane zgodne ze schemą', async () => {
    await validateSolarData(await getData())
})
