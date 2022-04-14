<script lang="ts">
    import { onMount } from 'svelte'
    import { Chart } from 'chart.js'
    import { EnergyProducedInfoDateFormat, type DataFormat } from 'format'
    import { parseDate } from 'calculation'

    export let data: DataFormat

    const valuesToUse = data.energyProduced.filter(
        item => parseDate(item.date, EnergyProducedInfoDateFormat).day() === 0 // niedziela
    )

    let chartValues = valuesToUse.map(item => item.value)
    let chartLabels = valuesToUse.map(item => item.date)

    let chartCanvas: HTMLCanvasElement

    onMount(() => {
        const chart = new Chart(chartCanvas, {
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
    <canvas bind:this={chartCanvas} width="4" height="1" />
</div>
