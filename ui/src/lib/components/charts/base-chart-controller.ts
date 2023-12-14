import {
    ChartType,
    type ChartDataItem,
    type ChartOptions,
} from '$lib/computation/chart-data'
import { DataRange } from '$lib/computation/records-for-range'
import type { Chart, ChartDataset } from 'chart.js'
import type { ChartController } from './chart-controller'

export type ChartJsType = Chart<'bar' | 'line', ChartDataItem[]>
export type ChartJsDataset = ChartDataset<'bar' | 'line', ChartDataItem[]>

export abstract class BaseChartController implements ChartController {
    private canvas: HTMLCanvasElement | null = null
    private options: ChartOptions = {
        type: ChartType.Bar,
        range: DataRange.Week,
    }

    private afterCallbacks: (() => void)[] = []

    protected chart: ChartJsType | null = null

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    protected beforeInitOrUpdate(): void {}

    protected abstract createChartInstance(
        canvas: HTMLCanvasElement,
    ): ChartJsType
    protected abstract doChartUpdate(): void

    getChart(): ChartJsType {
        if (!this.chart) {
            throw new Error('Obiekt wykresu nie jest dostępny')
        }

        return this.chart
    }

    getOptions(): ChartOptions {
        return this.options
    }

    setOptions(options: ChartOptions): void {
        this.options = options
        this.performUpdate()
    }

    initChart(canvas: HTMLCanvasElement): void {
        this.beforeInitOrUpdate()
        this.canvas = canvas
        this.chart = this.createChartInstance(canvas)
        this.runCallbacks()
    }

    switchChartType(): void {
        this.options.type =
            this.options.type === ChartType.Line
                ? ChartType.Bar
                : ChartType.Line

        if (!this.canvas || !this.chart) {
            return
        }

        const position = window.scrollY
        this.chart.destroy()
        this.chart = null

        this.initChart(this.canvas)

        // wywołanie destroy() wywołuje niepożądane działanie w postaci zmniejszenia rozmiaru strony
        // jeśli użytkownik znajduje się w dolnej części aplikacji, powoduje to przesunięcie widoku w górę
        // konieczne manualne przewinięcie do pozycji sprzed zwolnienia wykresu
        window.scrollTo({ top: position })
    }

    switchDataRange(): void {
        this.options.range =
            this.options.range === DataRange.Week
                ? DataRange.Month
                : DataRange.Week
        this.performUpdate()
    }

    onAfterInitOrUpdate(callback: () => void): void {
        this.afterCallbacks.push(callback)
    }

    private performUpdate(): void {
        if (!this.chart) {
            return
        }

        this.beforeInitOrUpdate()
        this.doChartUpdate()
        this.chart.update()
        this.runCallbacks()
    }

    private runCallbacks(): void {
        this.afterCallbacks.forEach(callback => callback())
    }
}
