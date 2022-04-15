<script lang="ts">
    import { onMount } from 'svelte'
    import { convertObjectToDataFormat, DataFormat } from 'format'
    import AppHeader from './components/AppHeader.svelte'
    import Content from './components/Content.svelte'
    import AppFooter from './components/AppFooter.svelte'
    import { getHashValue } from './utils/get-hash-value'
    import './utils/chartjs-import'
    import './utils/dayjs-import'

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
        if (!url) {
            throw new Error(
                'URL nie zawiera parametru "data-source", wskazującego na źródło danych dla aplikacji'
            )
        }

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
    <AppHeader />

    {#if status === Status.Loading}
        <h3>Trwa pobieranie danych...</h3>
    {:else if status === Status.Error}
        <p>⚠ Pobranie danych nie powiodło się.<br />{errorMessage}.</p>
    {:else if data !== null}
        <Content {url} {data} />
    {/if}

    <AppFooter />
</main>
