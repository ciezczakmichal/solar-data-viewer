import type { ChartOptions } from '$lib/computation/chart-data'
import type { Chart } from 'chart.js'

export interface ChartController {
    getChart(): Chart<any>
    getOptions(): ChartOptions

    switchChartType(): void
    switchDataRange(): void

    initChart(canvas: HTMLCanvasElement): void

    onAfterInitOrUpdate(callback: () => void): void
}
