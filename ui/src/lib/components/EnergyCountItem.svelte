<script lang="ts">
    import { formatKwh } from '../utils/formatters/format-numbers'
    import Item from './Item.svelte'

    interface Props {
        label?: string;
        value: number;
    }

    let { label = '', value }: Props = $props();
</script>

<Item {label} value={formatKwh(value)} />
