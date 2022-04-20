<script lang="ts">
    import type { DataFormat } from 'format'
    import CalculationResult from './CalculationResult.svelte'
    import Item from './Item.svelte'
    import YieldChart from './YieldChart.svelte'

    export let url: string
    export let data: DataFormat
</script>

<div>
    <Item label="Źródło danych" value={url} />
    <br />
    <CalculationResult {data} />

    <YieldChart {data} />
</div>
