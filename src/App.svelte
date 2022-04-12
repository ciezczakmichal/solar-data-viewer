<script lang="ts">
    import { onMount } from 'svelte'
    import { getHashValue } from './get-hash-value'

    let dataSourceUrl: string = ''

    function updateDataSource() {
        dataSourceUrl = getHashValue('data-source')
    }

    onMount(() => {
        updateDataSource()
        addEventListener('hashchange', updateDataSource)
    })
</script>

<main>
    <h1>Solar Data Viewer</h1>
    <div><b>Źródło danych:</b> {dataSourceUrl}</div>
</main>

<style>
</style>
