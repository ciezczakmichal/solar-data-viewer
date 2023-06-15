<script lang="ts">
    import { Chart } from 'chart.js'
    import { getAppContext } from '$lib/app-context'
    import { DataRange } from '$lib/computation/records-for-range'
    import { ChartType } from '$lib/computation/chart-data'
    import { formatKwh } from '$lib/utils/formatters/format-numbers'
    import {
        getBalanceChartData,
        type BalanceChartData,
    } from './balance-chart-data'
    import {
        BaseChartController,
        type ChartJsType,
    } from './base-chart-controller'
    import ChartViewer from './ChartViewer.svelte'

    const { data, metersHelper } = getAppContext()

    const from = metersHelper.getMeterInitialValuesAsCompleteRecord(
        metersHelper.getFirstMeterId()
    )

    class BalanceChartController extends BaseChartController {
        private chartData: BalanceChartData = []

        constructor() {
            super()
            this.setOptions({
                type: ChartType.Line,
                range: DataRange.Week,
            })
        }

        protected beforeInitOrUpdate(): void {
            this.chartData = getBalanceChartData({
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
                            label: 'Nadwyżka / niedobór energii',
                            backgroundColor: getColor,
                            borderColor: getColor,
                            data: this.chartData,
                            segment: {
                                borderColor: getSegmentColor,
                                backgroundColor: getSegmentColor,
                            },
                            cubicInterpolationMode: 'monotone',
                            tension: 0.4,
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

                                    return (
                                        label +
                                        ': ' +
                                        formatKwh(Math.abs(value))
                                    )
                                },
                            },
                        },
                    },
                },
            })
        }

        protected doChartUpdate(): void {
            this.getChart().data.datasets[0].data = this.chartData
        }
    }

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

    const controller = new BalanceChartController()
</script>

<ChartViewer
    {controller}
    title="Wykres bilansowania"
    description="Różnica pomiędzy ilością energii pobranej a przesłanej do sieci
    - przy uwzględnieniu współczynnika bilansowania."
/>
