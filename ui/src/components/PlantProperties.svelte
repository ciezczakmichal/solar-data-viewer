<script lang="ts">
    import { getAppContext } from '../app-context'
    import Item from './Item.svelte'

    const { data } = getAppContext()
    const { plantProperties: props } = data
</script>

<div class="data">
    {#if props.location}
        <Item label="Lokalizacja" value={props.location} />
    {/if}

    <Item label="Moc instalacji" value={props.installationPower} unit="kWp" />

    {#if props.pitch}
        <Item label="Nachylenie paneli" value={props.pitch} unit="°" />
    {/if}
    {#if props.orientation}
        <Item label="Orientacja" value={props.orientation} unit="°" />
    {/if}
    {#if props.panelsArea}
        <Item label="Powierzchnia paneli" value={props.panelsArea} unit="m²" />
    {/if}

    <Item label="Koszt inwestycji" value={props.investmentCost} unit="zł" />
</div>

<style>
    .data {
        line-height: 1.4;
    }
</style>
