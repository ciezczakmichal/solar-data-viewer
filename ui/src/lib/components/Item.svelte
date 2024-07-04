<script lang="ts">
    import currency from 'currency.js'
    import { formatNumber } from '../utils/formatters/format-numbers'

    export let label: string = ''
    export let value: currency | number | string
    export let unit: string = ''
    export let noSpaceBeforeUnit: boolean = false

    let valueToUse: string

    if (typeof value === 'number') {
        valueToUse = formatNumber(value)
    } else if (value instanceof currency) {
        valueToUse = value.format()
    } else {
        valueToUse = value
    }

    const space = noSpaceBeforeUnit ? '' : ' '
</script>

<div>
    {#if label}
        <b>{label}:</b>
    {/if}

    {`${valueToUse}${space}${unit}`}
</div>
