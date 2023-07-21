<script lang="ts">
    import { Chart } from 'chart.js'
    import { getAppContext } from '$lib/global/app-context'
    import { ChartType } from '$lib/computation/chart-data'
    import { formatKwh } from '$lib/utils/formatters/format-numbers'
    import {
        BaseChartController,
        type ChartJsType,
    } from './base-chart-controller'
    import ChartViewer from './ChartViewer.svelte'
    import {
        getConsumptionChartData,
        type ConsumptionChartData,
    } from './consumption-chart-data'
    import { getTooltipLabel } from './utils'

    const { data, metersHelper } = getAppContext()

    const from = metersHelper.getMeterInitialValuesAsCompleteRecord(
        metersHelper.getFirstMeterId()
    )

    class ConsumptionChartController extends BaseChartController {
        private chartData!: ConsumptionChartData

        protected beforeInitOrUpdate(): void {
            this.chartData = getConsumptionChartData({
                from,
                data,
                metersHelper,
                options: this.getOptions(),
            })
        }

        protected createChartInstance(canvas: HTMLCanvasElement): ChartJsType {
            const { type } = this.getOptions()

            return new Chart(canvas, {
                type: type === ChartType.Line ? 'line' : 'bar',
                data: {
                    datasets: [
                        {
                            label: 'Autokonsumpcja',
                            backgroundColor: '#6573c3',
                            borderColor: '#6573c3',
                            data: this.chartData.selfConsumptionData,
                            cubicInterpolationMode: 'monotone',
                            tension: 0.4,
                        },
                        {
                            label: 'Energia pobrana',
                            backgroundColor: '#2c387e',
                            borderColor: '#2c387e',
                            data: this.chartData.chargedEnergyData,
                            cubicInterpolationMode: 'monotone',
                            tension: 0.4,
                        },
                    ],
                },
                options: {
                    interaction: {
                        mode: 'x',
                        axis: 'x',
                    },
                    scales: {
                        x: {
                            stacked: true,
                        },
                        y: {
                            stacked: true,
                            title: {
                                display: true,
                                text: 'Energia w kWh',
                            },
                        },
                    },
                    plugins: {
                        tooltip: {
                            callbacks: {
                                label: getTooltipLabel,
                                footer: tooltipItems => {
                                    let sum = 0

                                    tooltipItems.forEach(
                                        item => (sum += item.parsed.y)
                                    )

                                    return 'Energia zużyta: ' + formatKwh(sum)
                                },
                            },
                        },
                    },
                },
            })
        }

        protected doChartUpdate(): void {
            const chart = this.getChart()
            chart.data.datasets[0].data = this.chartData.selfConsumptionData
            chart.data.datasets[1].data = this.chartData.chargedEnergyData
        }
    }

    const controller = new ConsumptionChartController()
</script>

<ChartViewer
    {controller}
    title="Wykres zużycia"
    description="Całkowita ilość energii zużytej przez dom."
/>
