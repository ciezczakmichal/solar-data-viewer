<script lang="ts">
    import { getAppContext } from '../global/app-context'
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
        <div
            class="tooltip"
            data-tip="Otwórz adres URL źródła danych (w nowej karcie)"
        >
            <a
                class="link-hover link"
                href={url}
                target="_blank"
                rel="noreferrer">{url}</a
            >
        </div>
    </div>

    <MessageList />

    <PlantProperties />
    <br />
    <CalculationResult />

    <YieldChart />
    <ConsumptionChart />
    <BalanceChart />
</div>
