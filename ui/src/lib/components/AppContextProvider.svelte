<script lang="ts">
    import { isCompleteRecord, type SolarData } from 'schema'
    import { MetersDataHelper, TimeVaryingValuesHelper } from 'calculation'
    import { setAppContext } from '$lib/global/app-context'

    export let data: SolarData
    export let url: string

    const metersHelper = new MetersDataHelper(data)
    const timeVaryingHelper = new TimeVaryingValuesHelper(data)

    const { values } = data

    const from = metersHelper.getMeterInitialValuesAsCompleteRecord(
        metersHelper.getFirstMeterId()
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
        timeVaryingHelper,
    })
</script>

<slot />
