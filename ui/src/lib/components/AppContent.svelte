<script lang="ts">
    import { getAppContext } from '../app-context'
    import YieldChart from './charts/YieldChart.svelte'
    import ConsumptionChart from './charts/ConsumptionChart.svelte'
    import BalanceChart from './charts/BalanceChart.svelte'
    import CalculationResult from './CalculationResult.svelte'
    import PlantProperties from './PlantProperties.svelte'
    import MessageList from './MessageList.svelte'

    const { url } = getAppContext()
</script>

<div>
    <div>
        <b>Źródło danych:</b>
        <a
            href={url}
            target="_blank"
            rel="noreferrer"
            title="Adres URL źródła danych (otwiera w nowej karcie)">{url}</a
        >
    </div>

    <MessageList />

    <PlantProperties />
    <br />
    <CalculationResult />

    <YieldChart />
    <ConsumptionChart />
    <BalanceChart />
</div>
