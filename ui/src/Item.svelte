<script lang="ts">
    export let label: string = ''
    export let value: string | number
    export let unit: string = ''
</script>

<div>
    {#if label !== ''}
        <b>{label}:</b>
    {/if}
    {value}
    {unit}
</div>
