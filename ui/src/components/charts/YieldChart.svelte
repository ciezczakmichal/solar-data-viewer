<script lang="ts">
    import { onMount } from 'svelte'
    import { Chart } from 'chart.js'
    import type { DataFormat } from 'format'
    import { formatKwh } from '../../utils/format'
    import { DataRange } from '../../utils/chart-data';
    import {
        ChartType,
                getChartData,
        type ChartData,
        type ChartDataItem,
        type ChartOptions,
    } from './yield-chart-data'

    export let data: DataFormat

    let chart: Chart<'bar' | 'line', ChartDataItem[]> | null = null
    let canvas: HTMLCanvasElement
    let options: ChartOptions = {
        type: ChartType.Bar,
        range: DataRange.Week,
    }

    let chartData: ChartData = {
        yieldData: [],
        yieldForecastData: [],
    }
    let chartDataNeedsUpdate = true

    function createChart() {
        chart = new Chart(canvas, {
            type: options.type === ChartType.Line ? 'line' : 'bar',
            data: {
                datasets: [],
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

        chartData = getChartData(data, options)

        const datasets = [
            {
                label: 'Uzysk',
                backgroundColor: '#ffc107',
                borderColor: '#ffc107',
                data: chartData.yieldData,
            },
        ]

        if (chartData.yieldForecastData.length > 0) {
            datasets.push({
                label: 'Uzysk prognozowany',
                backgroundColor: '#03a9f4',
                borderColor: '#03a9f4',
                data: chartData.yieldForecastData,
            })
        }

        chart.data.datasets = datasets
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

<div>
    <div class="chart-header">
        <h3>Wykres uzysku</h3>
        <div>
            <button on:click={handleSwitchType}>{switchTypeButtonText}</button>
            <button on:click={handleSwitchRange}>{switchRangeButtonText}</button
            >
        </div>
    </div>
    <canvas bind:this={canvas} width="4" height="1" />
</div>

<style>
    .chart-header {
        display: flex;
        align-items: center;
    }

    .chart-header h3 {
        flex-grow: 1;
    }
</style>
