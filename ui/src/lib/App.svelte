<script lang="ts">
    import {
        InvalidSolarDataSchemaError,
        validateSolarData,
        type SolarData,
    } from 'schema'
    import { onMount } from 'svelte'
    import './global/chartjs-import'
    import './global/dayjs-import'
    import AppContent from './components/AppContent.svelte'
    import AppContextProvider from './components/AppContextProvider.svelte'
    import AppFooter from './components/AppFooter.svelte'
    import AppHeader from './components/AppHeader.svelte'
    import { generateApplicationTitle } from './utils/app-title'
    import { getHashValue } from './utils/get-hash-value'

    enum Status {
        Loading,
        DataDisplay,
        Error,
    }

    let status = Status.Loading
    let errorMessage = ''

    let url: string = ''
    let data: SolarData | null = null

    function getDataUrl(): string {
        let result = getHashValue('source')

        // kompatybilność ze starymi adresami
        if (!result) {
            result = getHashValue('data-source')
        }

        return result
    }

    async function fetchData(): Promise<SolarData> {
        if (!url) {
            throw new Error(
                'URL nie zawiera parametru "source", wskazującego źródło danych dla aplikacji',
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

        return validateSolarData(data)
    }

    async function updateDataSource(): Promise<void> {
        status = Status.Loading
        errorMessage = ''
        url = getDataUrl()
        data = null

        try {
            data = await fetchData()
            status = Status.DataDisplay
        } catch (error) {
            if (error instanceof Error) {
                status = Status.Error
                errorMessage = error.message
            }

            // loguj błędy walidacji do konsoli @todo obsługa w UI
            if (error instanceof InvalidSolarDataSchemaError) {
                errorMessage =
                    error.message + '. Szczegóły w konsoli przeglądarki'
                console.error(error.schemaErrors)
            }
        }
    }

    onMount(() => {
        addEventListener('hashchange', updateDataSource)
        updateDataSource()

        return () => removeEventListener('hashchange', updateDataSource)
    })
</script>

<svelte:head>
    <title>{generateApplicationTitle(data)}</title>
</svelte:head>

<main class="p-4">
    <AppHeader />

    {#if status === Status.Loading}
        <h3>Trwa pobieranie danych...</h3>
    {:else if status === Status.Error}
        <p>
            ⚠️ Pobranie danych nie powiodło się.
            <br />
            {errorMessage}.
        </p>
        <p>
            Alternatywnie możesz wyświetlić <a href="#source=demo-data.json"
                >dane demo</a
            >.
        </p>
    {:else if data !== null}
        <AppContextProvider {data} {url}><AppContent /></AppContextProvider>
    {/if}

    <AppFooter />
</main>
