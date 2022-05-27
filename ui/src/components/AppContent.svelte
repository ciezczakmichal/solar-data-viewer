<script lang="ts">
    import type { DataFormat } from 'format'
    import PlantProperties from './PlantProperties.svelte'
    import CalculationResult from './CalculationResult.svelte'
    import YieldChart from './charts/YieldChart.svelte'
    import ConsumptionChart from './charts/ConsumptionChart.svelte'
    import BalanceChart from './charts/BalanceChart.svelte'

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

    <PlantProperties {data} />
    <br />
    <CalculationResult {data} />

    <div class="chart-container">
        <YieldChart {data} />
    </div>

    <div class="chart-container">
        <ConsumptionChart {data} />
    </div>

    <div class="chart-container">
        <BalanceChart {data} />
    </div>
</div>

<style>
    .chart-container {
        margin: 10px 0;
    }
</style>
