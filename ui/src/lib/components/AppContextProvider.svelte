<script lang="ts">
    import { setAppContext } from '$lib/global/app-context'
    import { MetersDataHelper, Tariff } from 'calculation'
    import { isCompleteRecord, type SolarData } from 'schema'

    export let data: SolarData
    export let url: string

    const metersHelper = new MetersDataHelper(data)
    const tariff = new Tariff(data.tariff, data.vatRates)

    const { values } = data

    const from = metersHelper.getMeterInitialValuesAsCompleteRecord(
        metersHelper.getFirstMeterId(),
    )
    const to = values[values.length - 1]

    // @todo automatyczne określanie zakresu dni
    if (!isCompleteRecord(to)) {
        throw new Error('Wybrane rekordy nie zawierają kompletnych danych')
    }

    setAppContext({
        data,
        url,
        from,
        to,
        metersHelper,
        tariff,
    })
</script>

<slot />
