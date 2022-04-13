<script lang="ts">
    import { onMount } from 'svelte'
    import { convertObjectToDataFormat, DataFormat } from 'format'
    import Content from './Content.svelte'
    import { getHashValue } from './get-hash-value'

    enum Status {
        Loading,
        DataDisplay,
        Error,
    }

    let status = Status.Loading
    let errorMessage = ''

    let url: string = ''
    let data: DataFormat | null = null

    async function fetchData(): Promise<DataFormat> {
        let response, data

        try {
            response = await fetch(url)
        } catch (error) {
            const message = error instanceof Error ? error.message : ''
            throw new Error(`Błąd połączenia sieciowego (${message})`)
        }

        try {
            data = await response.json()
        } catch {
            throw new Error('Dane nie są w formacie JSON')
        }

        return convertObjectToDataFormat(data)
    }

    async function updateDataSource(): Promise<void> {
        status = Status.Loading
        errorMessage = ''
        url = getHashValue('data-source')
        data = null

        try {
            data = await fetchData()
            status = Status.DataDisplay
        } catch (error) {
            if (error instanceof Error) {
                status = Status.Error
                errorMessage = error.message
            }
        }
    }

    onMount(() => {
        updateDataSource()
        addEventListener('hashchange', updateDataSource)
    })
</script>

<main>
    <h1>Solar Data Viewer</h1>

    {#if status === Status.Loading}
        <h3>Trwa pobieranie danych...</h3>
    {:else if status === Status.Error}
        <p>Pobranie danych nie powiodło się. {errorMessage}.</p>
    {:else if data !== null}
        <Content {url} {data} />
    {/if}
</main>
