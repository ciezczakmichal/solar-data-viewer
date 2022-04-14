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

    interface ChartDataItem {
        x: string
        y: number
    }

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

    let valuesToUse: EnergyProducedInfo[] = []
    let chartData: ChartDataItem[] = []

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

        chartData = valuesToUse.map(item => {
            const date = parseDate(item.date)
            let label

            if (dataRange === DataRange.Week) {
                label = date.format('DD.MM')
            } else {
                label = getMonthName(date.month())
            }

            return {
                x: label,
                y: item.value,
            }
        })

        if (chart) {
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
