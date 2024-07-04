<script lang="ts">
    import { getAppContext } from '../global/app-context'
    import Item from './Item.svelte'

    const { data } = getAppContext()
    const { plantProperties: props } = data
</script>

<div class="data">
    {#if props.location}
        <Item label="Lokalizacja" value={props.location} />
    {/if}

    <Item label="Moc instalacji" unit="kWp" value={props.installationPower} />

    {#if props.pitch}
        <Item
            label="Nachylenie paneli"
            noSpaceBeforeUnit
            unit="°"
            value={props.pitch}
        />
    {/if}

    {#if props.orientation}
        <Item
            label="Orientacja"
            noSpaceBeforeUnit
            unit="°"
            value={props.orientation}
        />
    {/if}

    {#if props.panelsArea}
        <Item label="Powierzchnia paneli" unit="m²" value={props.panelsArea} />
    {/if}

    <Item label="Koszt inwestycji" unit="zł" value={props.investmentCost} />
</div>

<style>
    .data {
        line-height: 1.4;
    }
</style>
