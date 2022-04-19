<script lang="ts">
    import type { DataFormat } from 'format'
    import { calculateEnergy, calculateInvestment } from 'calculation'
    import Item from './Item.svelte'
    import EnergyCountItem from './EnergyCountItem.svelte'
    import { formatNumber, formatKwh } from '../utils/format'

    export let data: DataFormat

    const {
        days,
        produced,
        dailyProduction,
        kWhTokWp,
        selfConsumed,
        selfConsumedPercent,
        donated,
        donatedToUse,
        charged,
        totalConsumption,
        dailyConsumption,

        fulfillNeeds,
        savedEnergy,
        needsFulfilmentPercent,
        energyToBuy,
        energyToCharge,
    } = calculateEnergy({
        producedDb: data.energyProduced,
        meterDb: data.meter,
        properties: data.plantProperties,
    })

    const {
        savedCost,
        dailySaving,
        investmentReturnYears,
        investmentReturnMonths,
    } = calculateInvestment({
        days,
        savedEnergy,
        investmentCost: data.plantProperties.investmentCost,
        tariffItems: data.tariff,
    })
</script>

<div>
    <Item label="Czas pracy instalacji" value={days} unit="dni" />
    <EnergyCountItem label="Energia wyprodukowana" value={produced} />
    <EnergyCountItem
        label="Średnia dzienna produkcja energii"
        value={dailyProduction}
    />
    <Item label="kWh/kWp" value={formatNumber(kWhTokWp)} />

    <Item
        label="Autokonsumpcja"
        value={`${formatKwh(selfConsumed)} (${selfConsumedPercent} produkcji)`}
    />
    <Item
        label="Oddano do sieci"
        value={`${formatKwh(donated)} (= do pobrania ${formatKwh(
            donatedToUse
        )})`}
    />

    <EnergyCountItem label="Pobrano energii z sieci" value={charged} />
    <EnergyCountItem
        label="Całkowite zużycie energii"
        value={totalConsumption}
    />
    <EnergyCountItem
        label="Średnie dzienne zużycie energii"
        value={dailyConsumption}
    />
    <br />

    {#if fulfillNeeds}
        <Item
            label="WYNIK"
            value="Ilość wyprodukowanej energii pokrywa zapotrzebowanie, posiadana nadwyżka."
        />
        <EnergyCountItem
            label="Ilość energii pozostała w magazynie do pobrania"
            value={energyToCharge}
        />
    {:else}
        <Item
            label="WYNIK"
            value="Ilość wyprodukowanej energii nie pokrywa zapotrzebowania."
        />
        <Item
            value={`Zapotrzebowanie na energię elektryczną jest spełnione w ${needsFulfilmentPercent}`}
        />
        <EnergyCountItem
            label="Ilość energii pozostała do rozliczenia (zapłaty)"
            value={energyToBuy}
        />
    {/if}

    <Item
        value={`Gdyby nie panele, trzeba by zapłacić za ${formatKwh(
            savedEnergy
        )} energii`}
    />

    <br />
    <div class="beta">
        Poniżej wartości eksperymentalne, nie uwzględniające zmian w 2022 r.
    </div>

    <Item
        value={`Gdyby nie panele, trzeba by zapłacić ${savedCost.format()}`}
    />
    <Item
        label="Średnia kwota oszczędności na dzień"
        value={dailySaving.format()}
    />
    <!-- @todo dodać wersję relatywną (za ile od teraz) -->
    <Item
        value={`Inwestycja zwróci się po ${investmentReturnYears} latach, ${investmentReturnMonths} miesiącach`}
    />
</div>

<style>
    .beta {
        color: rgb(255, 52, 52);
        font-weight: 700;
    }
</style>
