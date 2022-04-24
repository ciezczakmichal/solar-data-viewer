<script lang="ts">
    import { onMount } from 'svelte'
    import { Chart } from 'chart.js'
    import type { DataFormat } from 'format'
    import { formatKwh } from '../../utils/format'
    import {
        ChartType,
        DataRange,
        getChartData,
        type ChartData,
        type ChartDataItem,
        type ChartOptions,
    } from './fulfillment-chart-data'

    export let data: DataFormat

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
                        label: 'Nadwyżka / niedobór',
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

        chart.data.datasets[0].data = chartData
        chart.update()

        chartDataNeedsUpdate = false
    }

    function handleSwitchType() {
        options.type =
            options.type === ChartType.Line ? ChartType.Bar : ChartType.Line
        chartDataNeedsUpdate = true

        if (chart) {
            chart.destroy()
            chart = null
        }

        createChart()
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
        <h3>Wykres spełnienia zapotrzebowania</h3>
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
