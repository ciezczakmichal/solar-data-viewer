<script lang="ts">
    import { onMount } from 'svelte'
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
    let data: object = {}

    async function fetchData(): Promise<object> {
        let response

        try {
            response = await fetch(url)
        } catch (error) {
            const message = error instanceof Error ? error.message : ''
            throw new Error(`Błąd połączenia sieciowego (${message})`)
        }

        try {
            return await response.json()
        } catch {
            throw new Error('Dane nie są w formacie JSON')
        }

        // @todo walidacja zgodności z formatem
    }

    async function updateDataSource(): Promise<void> {
        status = Status.Loading
        errorMessage = ''
        url = getHashValue('data-source')
        data = {}

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
    {:else}
        <Content {url} {data} />
    {/if}
</main>
