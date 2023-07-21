<script lang="ts">
    import type { SolarData } from 'schema'
    import { MetersDataHelper, TimeVaryingValuesHelper } from 'calculation'
    import { setAppContext } from '$lib/global/app-context'

    export let data: SolarData
    export let url: string

    const metersHelper = new MetersDataHelper(data)
    const timeVaryingHelper = new TimeVaryingValuesHelper(data)

    setAppContext({
        data,
        url,
        metersHelper,
        timeVaryingHelper,
    })
</script>

<slot />
