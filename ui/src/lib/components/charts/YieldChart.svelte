<script lang="ts">
    import { Chart } from 'chart.js'
    import { getAppContext } from '$lib/global/app-context'
    import { ChartType } from '$lib/computation/chart-data'
    import {
        BaseChartController,
        type ChartJsDataset,
        type ChartJsType,
    } from './base-chart-controller'
    import ChartViewer from './ChartViewer.svelte'
    import { getYieldChartData, type YieldChartData } from './yield-chart-data'
    import { getTooltipLabel } from './utils'

    const { data, from, metersHelper } = getAppContext()

    class YieldChartController extends BaseChartController {
        private chartData!: YieldChartData

        protected beforeInitOrUpdate(): void {
            this.chartData = getYieldChartData({
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
                    datasets: this.getChartDatasets() as any,
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
                                label: getTooltipLabel,
                            },
                        },
                    },
                },
            })
        }

        protected doChartUpdate(): void {
            this.getChart().data.datasets = this.getChartDatasets()
        }

        private getChartDatasets(): ChartJsDataset[] {
            const datasets: ChartJsDataset[] = [
                {
                    label: 'Uzysk',
                    backgroundColor: '#ffc107',
                    borderColor: '#ffc107',
                    data: this.chartData.yieldData,
                    cubicInterpolationMode: 'monotone',
                    tension: 0.4,
                },
            ]

            if (this.chartData.yieldForecastData.length > 0) {
                datasets.push({
                    label: 'Uzysk prognozowany',
                    backgroundColor: '#03a9f4',
                    borderColor: '#03a9f4',
                    data: this.chartData.yieldForecastData,
                    // ustawienia interpolacji zbędne - dane tylko na wykresie kolumnowym
                })
            }

            return datasets
        }
    }

    const controller = new YieldChartController()
</script>

<ChartViewer
    {controller}
    title="Wykres uzysku"
    description="Ilość energii wyprodukowanej przez instalację."
/>
