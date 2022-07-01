<script lang="ts">
    import { getAppContext } from '../app-context'
    import PlantProperties from './PlantProperties.svelte'
    import CalculationResult from './CalculationResult.svelte'
    import YieldChart from './charts/YieldChart.svelte'
    import ConsumptionChart from './charts/ConsumptionChart.svelte'
    import BalanceChart from './charts/BalanceChart.svelte'

    const { url } = getAppContext()
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

    <PlantProperties />
    <br />
    <CalculationResult />

    <div class="chart-container">
        <YieldChart />
    </div>

    <div class="chart-container">
        <ConsumptionChart />
    </div>

    <div class="chart-container">
        <BalanceChart />
    </div>
</div>

<style>
    .chart-container {
        margin: 10px 0;
    }
</style>
