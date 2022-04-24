<script lang="ts">
    import type { DataFormat } from 'format'
    import CalculationResult from './CalculationResult.svelte'
    import YieldChart from './charts/YieldChart.svelte'

    export let url: string
    export let data: DataFormat
</script>

<div>
    <div>
        <b>Źródło danych:</b>
        <a
            href={url}
            target="_blank"
            title="Adres URL źródła danych (otwiera w nowej karcie)">{url}</a
        >
    </div>
    <br />

    <CalculationResult {data} />
    <YieldChart {data} />
</div>
