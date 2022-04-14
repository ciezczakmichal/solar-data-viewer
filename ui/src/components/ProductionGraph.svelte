<script lang="ts">
    import { onMount } from 'svelte'
    import { Chart } from 'chart.js'
    import {
        EnergyProducedInfo,
        EnergyProducedInfoDateFormat,
        type DataFormat,
    } from 'format'
    import { parseDate } from 'calculation'

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
            valuesToUse = data.energyProduced.filter(
                item =>
                    parseDate(item.date, EnergyProducedInfoDateFormat).day() ===
                    0 // niedziela
            )
        } else {
            valuesToUse = data.energyProduced.filter(item => {
                const date = parseDate(item.date, EnergyProducedInfoDateFormat)
                return date.date() === date.daysInMonth()
            })
        }

        chartValues = valuesToUse.map(item => item.value)
        chartLabels = valuesToUse.map(item => item.date)

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
        <h3>Wykres energii wyprodukowanej</h3>
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
