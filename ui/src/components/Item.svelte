<script lang="ts">
    import { formatNumber } from '../utils/format'

    export let label: string = ''
    export let value: string | number
    export let unit: string = ''
</script>

<div>
    {#if label}
        <b>{label}:</b>
    {/if}

    {#if typeof value === 'number'}
        {formatNumber(value)}
    {:else}
        {value}
    {/if}

    {unit}
</div>
