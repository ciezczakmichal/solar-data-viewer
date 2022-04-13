<script lang="ts">
    import { onMount } from 'svelte'
    import type { DataFormat } from 'format'

    export let url: string
    export let data: DataFormat

    onMount(() => console.log(data))
</script>

<div>
    <div><b>Źródło danych:</b> {url}</div>
</div>
