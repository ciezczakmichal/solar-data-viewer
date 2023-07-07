<script lang="ts">
    import { onMount } from 'svelte'
    import { ChartType } from '$lib/computation/chart-data'
    import { DataRange } from '$lib/computation/records-for-range'
    import type { ChartController } from './chart-controller'

    export let controller: ChartController
    export let title: string
    export let description: string

    let canvas: HTMLCanvasElement

    let switchTypeButtonText: string
    let switchRangeButtonText: string

    function updateButtonTexts() {
        const { type, range } = controller.getOptions()

        switchTypeButtonText =
            'Wykres ' +
            (type === ChartType.Line ? 'liniowy (narastająco)' : 'kolumnowy')

        switchRangeButtonText =
            'Dane ' + (range === DataRange.Week ? 'tygodniowe' : 'miesięczne')
    }

    updateButtonTexts()
    controller.onAfterInitOrUpdate(updateButtonTexts)

    onMount(() => controller.initChart(canvas))
</script>

<div class="chart">
    <div class="chart-header">
        <div class="chart-names">
            <h3>{title}</h3>
            <div class="chart-desc">{description}</div>
        </div>
        <div>
            <button on:click={() => controller.switchChartType()}
                >{switchTypeButtonText}</button
            >
            <button on:click={() => controller.switchDataRange()}
                >{switchRangeButtonText}</button
            >
        </div>
    </div>
    <canvas bind:this={canvas} width="4" height="1" />
</div>

<style>
    .chart {
        margin: 10px 0;
        padding-top: 10px;
    }

    .chart-header {
        display: flex;
        align-items: center;
    }

    .chart-names {
        flex-grow: 1;
    }

    h3 {
        margin: 0;
        margin-bottom: 6px;
    }

    .chart-desc {
        font-size: 14px;
        color: #666;
    }
</style>
