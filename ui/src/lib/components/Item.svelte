<script lang="ts">
    import currency from 'currency.js'
    import { formatNumber } from '../utils/formatters/format-numbers'

    interface Props {
        label?: string
        value: currency | number | string
        unit?: string
        noSpaceBeforeUnit?: boolean
    }

    let {
        label = '',
        value,
        unit = '',
        noSpaceBeforeUnit = false,
    }: Props = $props()

    let valueToUse = $derived.by<string>(() => {
        if (typeof value === 'number') {
            return formatNumber(value)
        } else if (value instanceof currency) {
            return value.format()
        }

        return value
    })

    const space = $derived(noSpaceBeforeUnit ? '' : ' ')
</script>

<div>
    {#if label}
        <b>{label}:</b>
    {/if}

    {`${valueToUse}${space}${unit}`}
</div>
