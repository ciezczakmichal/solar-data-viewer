<script lang="ts">
    import { ChartType } from '$lib/computation/chart-data'
    import { DataRange } from '$lib/computation/records-for-range'
    import { onMount } from 'svelte'
    import type { ChartController } from './chart-controller'

    interface Props {
        controller: ChartController
        title: string
        description: string
    }

    let { controller, title, description }: Props = $props()

    let canvas: HTMLCanvasElement

    let switchTypeButtonText = $state('')
    let switchRangeButtonText = $state('')

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

<div class="mt-2 pt-2">
    <div class="flex items-center">
        <div class="flex-grow">
            <div class="mb-1 text-lg font-bold">{title}</div>
            <div class="text-sm text-gray-600">{description}</div>
        </div>
        <div>
            <button
                class="btn btn-neutral"
                onclick={() => controller.switchChartType()}
            >
                {switchTypeButtonText}
            </button>
            <button
                class="btn btn-neutral"
                onclick={() => controller.switchDataRange()}
            >
                {switchRangeButtonText}
            </button>
        </div>
    </div>
    <canvas bind:this={canvas} height="1" width="4"></canvas>
</div>
