<script lang="ts">
    import { onMount } from 'svelte'
    import {
        InvalidSolarDataSchemaError,
        validateSolarData,
        type SolarData,
    } from 'schema'
    import { MetersDataHelper } from 'calculation'
    import AppHeader from './components/AppHeader.svelte'
    import AppContent from './components/AppContent.svelte'
    import AppFooter from './components/AppFooter.svelte'
    import { setAppContext } from './app-context'
    import { formatNumber } from './utils/formatters/format-numbers'
    import { getHashValue } from './utils/get-hash-value'
    import './utils/chartjs-import'
    import './utils/dayjs-import'

    setAppContext({
        getUrl: () => url,
        getData: () => {
            if (!data) {
                throw new Error('Dane nie są dostępne')
            }

            return data
        },
        getMetersHelper: () => {
            if (!metersHelper) {
                throw new Error('Obiekt nie jest dostępny')
            }

            return metersHelper
        },
    })

    const baseAppTitle = document.title

    enum Status {
        Loading,
        DataDisplay,
        Error,
    }

    let status = Status.Loading
    let errorMessage = ''

    let url: string = ''
    let data: SolarData | null = null

    // @todo przenieść - zależy tylko od danych - osobny kontekst?
    let metersHelper: MetersDataHelper | null = null

    async function fetchData(): Promise<SolarData> {
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

        return validateSolarData(data)
    }

    async function updateDataSource(): Promise<void> {
        status = Status.Loading
        errorMessage = ''
        url = getHashValue('data-source')
        data = null
        metersHelper = null

        try {
            data = await fetchData()
            metersHelper = new MetersDataHelper(data)
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

    function generateApplicationTitle(data: SolarData): string {
        let title = baseAppTitle

        const { location, installationPower } = data.plantProperties
        const powerString = formatNumber(installationPower) + ' kWp'

        if (location) {
            title = `${location} ${powerString} | ${title}`
        }

        return title
    }

    $: document.title = data ? generateApplicationTitle(data) : baseAppTitle

    onMount(() => {
        addEventListener('hashchange', updateDataSource)
        updateDataSource()
    })
</script>

<main>
    <AppHeader />

    {#if status === Status.Loading}
        <h3>Trwa pobieranie danych...</h3>
    {:else if status === Status.Error}
        <p>⚠ Pobranie danych nie powiodło się.<br />{errorMessage}.</p>
    {:else if data !== null}
        <AppContent />
    {/if}

    <AppFooter />
</main>
