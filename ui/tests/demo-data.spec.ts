import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { readFile } from 'fs/promises'
import { validateSolarData } from 'schema'

const filename = fileURLToPath(import.meta.url)
const dir = dirname(filename)

async function getData(): Promise<Record<string, any>> {
    const path = join(dir, '../static/demo-data.json')
    const json = await readFile(path, 'utf8')
    return JSON.parse(json)
}

it('plik demo-data.json zawiera dane zgodne ze schemą', async () => {
    await validateSolarData(await getData())
})
