<script lang="ts">
    import { onMount } from 'svelte'
    import { Chart } from 'chart.js'
    import type { EnergyProducedInfo, DataFormat } from 'format'
    import { parseDate } from 'calculation'
    import { getMonthName } from '../utils/date'

    export let data: DataFormat

    enum DataRange {
        Week,
        Month,
    }

    let chart: Chart | null = null
    let chartCanvas: HTMLCanvasElement
    let dataRange = DataRange.Week

    function handleSwitchRange() {
        dataRange =
            dataRange === DataRange.Week ? DataRange.Month : DataRange.Week
    }

    $: switchButtonText =
        'Przełącz na widok ' +
        (dataRange === DataRange.Week ? 'miesięczny' : 'tygodniowy')

    let valuesToUse: EnergyProducedInfo[] = []
    let chartValues: number[] = []
    let chartLabels: string[] = []

    $: {
        if (dataRange === DataRange.Week) {
            valuesToUse = data.energyProduced.filter(item => {
                // dane z niedzieli
                const date = parseDate(item.date)
                return date.day() === 0
            })
        } else {
            valuesToUse = data.energyProduced.filter(item => {
                // dane z ostatniego dnia miesiąca
                const date = parseDate(item.date)
                return date.date() === date.daysInMonth()
            })
        }

        chartValues = valuesToUse.map(item => item.value)

        if (dataRange === DataRange.Week) {
            chartLabels = valuesToUse.map(item => {
                const date = parseDate(item.date)
                return date.format('DD.MM')
            })
        } else {
            chartLabels = valuesToUse.map(item => {
                const date = parseDate(item.date)
                return getMonthName(date.month())
            })
        }

        if (chart) {
            chart.data.labels = chartLabels
            chart.data.datasets[0].data = chartValues
            chart.update()
        }
    }

    onMount(() => {
        chart = new Chart(chartCanvas, {
            type: 'line',
            data: {
                labels: chartLabels,
                datasets: [
                    {
                        label: 'Energia wyprodukowana (kWh)',
                        backgroundColor: '#ffc107',
                        borderColor: '#ffc107',
                        data: chartValues,
                    },
                ],
            },
        })
    })
</script>

<div>
    <div class="graph-header">
        <h3>Wykres energii wyprodukowanej (narastająco)</h3>
        <div>
            <button on:click={handleSwitchRange}>{switchButtonText}</button>
        </div>
    </div>
    <canvas bind:this={chartCanvas} width="4" height="1" />
</div>

<style>
    .graph-header {
        display: flex;
    }

    .graph-header h3 {
        flex-grow: 1;
    }
</style>
