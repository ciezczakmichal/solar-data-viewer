<script lang="ts">
    import { onMount } from 'svelte'

    export let url: string
    export let data: object

    onMount(() => console.log(data))
</script>

<div>
    <div><b>Źródło danych:</b> {url}</div>
</div>
