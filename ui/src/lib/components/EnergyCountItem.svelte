<script lang="ts">
    import { formatKwh } from '../utils/formatters/format-numbers'

    import Item from './Item.svelte'

    export let label: string = ''
    export let value: number
</script>

<Item {label} value={formatKwh(value)} />
