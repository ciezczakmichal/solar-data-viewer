<script lang="ts">
    import { onMount } from 'svelte'
    import { Chart } from 'chart.js'
    import { getAppContext } from '../../app-context'
    import { formatKwh } from '../../utils/formatters/format-numbers'
    import { DataRange } from '../../utils/chart-data'
    import {
        ChartType,
        getChartData,
        type ChartData,
        type ChartDataItem,
        type ChartOptions,
    } from './balance-chart-data'

    const { data, metersHelper } = getAppContext()

    let chart: Chart<'bar' | 'line', ChartDataItem[]> | null = null
    let canvas: HTMLCanvasElement
    let options: ChartOptions = {
        type: ChartType.Line,
        range: DataRange.Week,
    }

    let chartData: ChartData = []
    let chartDataNeedsUpdate = true

    function getColorFromValue(value: number): string {
        return value >= 0 ? '#4caf50' : '#ff1744'
    }

    function getColor(ctx: any) {
        if (ctx.type !== 'data') {
            return undefined
        }

        return getColorFromValue(ctx.parsed.y)
    }

    function getSegmentColor(ctx: any) {
        return getColorFromValue(ctx.p1.parsed.y)
    }

    function createChart() {
        chart = new Chart(canvas, {
            type: options.type === ChartType.Line ? 'line' : 'bar',
            data: {
                datasets: [
                    {
                        label: 'Nadwyżka / niedobór energii',
                        backgroundColor: getColor,
                        borderColor: getColor,
                        data: chartData,
                        segment: {
                            borderColor: getSegmentColor,
                            backgroundColor: getSegmentColor,
                        },
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
                        grid: {
                            color: function (context) {
                                if (context.tick.value === 0) {
                                    return 'rgba(0, 0, 0, 0.5)'
                                }

                                return 'rgba(0, 0, 0, 0.1)'
                            },
                        },
                    },
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                const value = context.parsed.y

                                if (value === null) {
                                    return ''
                                }

                                const label =
                                    value > 0
                                        ? 'Nadwyżka energii'
                                        : value < 0
                                        ? 'Niedobór energii'
                                        : context.dataset.label || ''

                                return label + ': ' + formatKwh(Math.abs(value))
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

        chartData = getChartData(data, metersHelper, options)

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
            <h3>Wykres bilansowania</h3>
            <div class="chart-desc">
                Różnica pomiędzy ilością energii pobranej a przesłanej do sieci
                - przy uwzględnieniu współczynnika bilansowania.
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
