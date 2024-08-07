import type { TooltipItem } from 'chart.js'
import { formatKwh } from '$lib/utils/formatters/format-numbers'

export function getTooltipLabel(context: TooltipItem<'bar' | 'line'>) {
    let label = context.dataset.label || ''

    if (label) {
        label += ': '
    }

    if (context.parsed.y !== null) {
        label += formatKwh(context.parsed.y)
    }

    return label
}
