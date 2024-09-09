<script lang="ts">
    import { getAppContext } from '../global/app-context'
    import CalculationResult from './CalculationResult.svelte'
    import MessageList from './MessageList.svelte'
    import PlantProperties from './PlantProperties.svelte'
    import BalanceChart from './charts/BalanceChart.svelte'
    import ConsumptionChart from './charts/ConsumptionChart.svelte'
    import YieldChart from './charts/YieldChart.svelte'

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
                rel="noreferrer"
                target="_blank"
            >
                {url}
            </a>
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
