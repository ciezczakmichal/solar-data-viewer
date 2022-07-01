<script lang="ts">
    import { formatNumber } from '../utils/formatters/format-numbers'

    export let label: string = ''
    export let value: string | number
    export let unit: string = ''
    export let noSpaceBeforeUnit: boolean = false

    let valueToUse = value

    if (typeof value === 'number') {
        valueToUse = formatNumber(value)
    }

    const space = noSpaceBeforeUnit ? '' : ' '
</script>

<div>
    {#if label}
        <b>{label}:</b>
    {/if}

    {`${valueToUse}${space}${unit}`}
</div>
