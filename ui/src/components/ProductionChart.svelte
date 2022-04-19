<script lang="ts">
    import { onMount } from 'svelte'
    import { Chart } from 'chart.js'
    import type { DataFormat } from 'format'
    import {
        DataRange,
        getChartData,
        type ChartDataItem,
    } from './production-chart'

    export let data: DataFormat

    let chart: Chart<'line', ChartDataItem[]> | null = null
    let chartCanvas: HTMLCanvasElement
    let dataRange = DataRange.Week

    function handleSwitchRange() {
        dataRange =
            dataRange === DataRange.Week ? DataRange.Month : DataRange.Week
    }

    $: switchButtonText =
        'Przełącz na widok ' +
        (dataRange === DataRange.Week ? 'miesięczny' : 'tygodniowy')

    let chartData: ChartDataItem[] = []

    $: {
        if (chart) {
            chartData = getChartData(data, dataRange)

            chart.data.datasets[0].data = chartData
            chart.update()
        }
    }

    onMount(() => {
        chart = new Chart(chartCanvas, {
            type: 'line',
            data: {
                datasets: [
                    {
                        label: 'Energia wyprodukowana (kWh)',
                        backgroundColor: '#ffc107',
                        borderColor: '#ffc107',
                        data: chartData,
                    },
                ],
            },
        })
    })
</script>

<div>
    <div class="chart-header">
        <h3>Wykres energii wyprodukowanej (narastająco)</h3>
        <div>
            <button on:click={handleSwitchRange}>{switchButtonText}</button>
        </div>
    </div>
    <canvas bind:this={chartCanvas} width="4" height="1" />
</div>

<style>
    .chart-header {
        display: flex;
    }

    .chart-header h3 {
        flex-grow: 1;
    }
</style>
