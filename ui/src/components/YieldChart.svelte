<script lang="ts">
    import { onMount } from 'svelte'
    import { Chart } from 'chart.js'
    import type { DataFormat } from 'format'
    import {
        ChartType,
        DataRange,
        getChartData,
        type ChartDataItem,
        type ChartOptions,
    } from './yield-chart-data'

    export let data: DataFormat

    let chart: Chart<'line' | 'bar', ChartDataItem[]> | null = null
    let canvas: HTMLCanvasElement
    let options: ChartOptions = {
        type: ChartType.Bar,
        range: DataRange.Week,
    }

    let chartData: ChartDataItem[] = []

    function createChart() {
        chart = new Chart(canvas, {
            type: options.type === ChartType.Line ? 'line' : 'bar',
            data: {
                datasets: [
                    {
                        label: 'Uzysk',
                        backgroundColor: '#ffc107',
                        borderColor: '#ffc107',
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
                                    label += context.parsed.y + ' kWh'
                                }

                                return label
                            },
                        },
                    },
                },
            },
        })
    }

    function handleSwitchType() {
        options.type =
            options.type === ChartType.Line ? ChartType.Bar : ChartType.Line

        if (chart) {
            chart.destroy()
            chart = null
        }

        createChart()
    }

    function handleSwitchRange() {
        options.range =
            options.range === DataRange.Week ? DataRange.Month : DataRange.Week
    }

    $: switchTypeButtonText =
        'Wykres ' +
        (options.type === ChartType.Line
            ? 'liniowy (narastająco)'
            : 'kolumnowy')

    $: switchRangeButtonText =
        'Dane ' +
        (options.range === DataRange.Week ? 'tygodniowe' : 'miesięczne')

    $: if (chart) {
        chartData = getChartData(data, options)

        chart.data.datasets[0].data = chartData
        chart.update()
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
    }

    .chart-header h3 {
        flex-grow: 1;
    }
</style>
