<script lang="ts">
    import { onMount } from 'svelte'
    import { Chart } from 'chart.js'
    import { getAppContext } from '../../app-context'
    import { DataRange } from '../../computation/records-for-range'
    import {
        ChartType,
        type ChartDataItemWithDate,
        type ChartOptions,
    } from '../../computation/chart-data'
    import { formatKwh } from '../../utils/formatters/format-numbers'
    import {
        getConsumptionChartData,
        type ConsumptionChartData,
    } from './consumption-chart-data'

    const { data, metersHelper } = getAppContext()

    const from = metersHelper.getMeterInitialValuesAsCompleteRecord(
        metersHelper.getFirstMeterId()
    )

    let chart: Chart<'bar' | 'line', ChartDataItemWithDate[]> | null = null
    let canvas: HTMLCanvasElement
    let options: ChartOptions = {
        type: ChartType.Bar,
        range: DataRange.Week,
    }

    let chartData: ConsumptionChartData = []
    let chartDataNeedsUpdate = true

    function createChart() {
        chart = new Chart(canvas, {
            type: options.type === ChartType.Line ? 'line' : 'bar',
            data: {
                datasets: [
                    {
                        label: 'Energia zużyta',
                        backgroundColor: '#2c387e',
                        borderColor: '#2c387e',
                        data: chartData,
                    },
                ],
            },
            options: {
                scales: {
                    y: {
                        title: {
                            display: true,
                            text: 'Energia w kWh',
                        },
                    },
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                let label = context.dataset.label || ''

                                if (label) {
                                    label += ': '
                                }

                                if (context.parsed.y !== null) {
                                    label += formatKwh(context.parsed.y)
                                }

                                return label
                            },
                        },
                    },
                },
            },
        })

        updateChartData()
    }

    function updateChartData() {
        if (!chart || !chartDataNeedsUpdate) {
            return
        }

        chartData = getConsumptionChartData({
            from,
            data,
            metersHelper,
            options,
        })

        chart.data.datasets[0].data = chartData
        chart.update()

        chartDataNeedsUpdate = false
    }

    function handleSwitchType() {
        options.type =
            options.type === ChartType.Line ? ChartType.Bar : ChartType.Line
        chartDataNeedsUpdate = true

        let position = null

        if (chart) {
            position = window.scrollY
            chart.destroy()
            chart = null
        }

        createChart()

        // wywołanie destroy() wywołuje niepożądane działanie w postaci zmniejszenia rozmiaru strony
        // jeśli użytkownik znajduje się w dolnej części aplikacji, powoduje to przesunięcie widoku w górę
        // konieczne manualne przewinięcie do pozycji sprzed zwolnienia wykresu
        if (position) {
            window.scrollTo({ top: position })
        }
    }

    function handleSwitchRange() {
        options.range =
            options.range === DataRange.Week ? DataRange.Month : DataRange.Week
        chartDataNeedsUpdate = true
    }

    $: switchTypeButtonText =
        'Wykres ' +
        (options.type === ChartType.Line
            ? 'liniowy (narastająco)'
            : 'kolumnowy')

    $: switchRangeButtonText =
        'Dane ' +
        (options.range === DataRange.Week ? 'tygodniowe' : 'miesięczne')

    $: if (chartDataNeedsUpdate) {
        updateChartData()
    }

    onMount(createChart)
</script>

<div class="chart">
    <div class="chart-header">
        <div class="chart-names">
            <h3>Wykres zużycia</h3>
            <div class="chart-desc">
                Całkowita ilość energii zużytej przez dom.
            </div>
        </div>
        <div>
            <button on:click={handleSwitchType}>{switchTypeButtonText}</button>
            <button on:click={handleSwitchRange}>{switchRangeButtonText}</button
            >
        </div>
    </div>
    <canvas bind:this={canvas} width="4" height="1" />
</div>

<style>
    .chart {
        padding-top: 10px;
    }

    .chart-header {
        display: flex;
        align-items: center;
    }

    .chart-names {
        flex-grow: 1;
    }

    h3 {
        margin: 0;
        margin-bottom: 6px;
    }

    .chart-desc {
        font-size: 14px;
        color: #666;
    }
</style>
