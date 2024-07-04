<script lang="ts">
    import { ChartType } from '$lib/computation/chart-data'
    import { DataRange } from '$lib/computation/records-for-range'
    import { getAppContext } from '$lib/global/app-context'
    import { formatKwh } from '$lib/utils/formatters/format-numbers'
    import {
        Chart,
        type ScriptableContext,
        type ScriptableLineSegmentContext,
    } from 'chart.js'
    import ChartViewer from './ChartViewer.svelte'
    import {
        type BalanceChartData,
        getBalanceChartData,
    } from './balance-chart-data'
    import {
        BaseChartController,
        type ChartJsType,
    } from './base-chart-controller'

    const { data, from, metersHelper } = getAppContext()

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

    function getColor(ctx: ScriptableContext<'bar' | 'line'>) {
        if (ctx.type !== 'data') {
            return undefined
        }

        return getColorFromValue(ctx.parsed.y)
    }

    function getSegmentColor(ctx: ScriptableLineSegmentContext) {
        return getColorFromValue(ctx.p1.parsed.y)
    }

    const controller = new BalanceChartController()
</script>

<ChartViewer
    {controller}
    description="Różnica pomiędzy ilością energii pobranej a przesłanej do sieci
    - przy uwzględnieniu współczynnika bilansowania."
    title="Wykres bilansowania"
/>
