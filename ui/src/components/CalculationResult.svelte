<script lang="ts">
    import { isCompleteRecord, type DataFormat } from 'format'
    import { calculateEnergy, calculateInvestment } from 'calculation'
    import Item from './Item.svelte'
    import EnergyCountItem from './EnergyCountItem.svelte'
    import {
        formatNumber,
        formatKwh,
        formatPercent,
        formatDate,
    } from '../utils/format'

    export let data: DataFormat
    const { values, plantProperties, tariff } = data

    // @todo wydzielić sprawdzanie (walidacja dokonana przez format)
    if (values.length < 3) {
        throw new Error('Wymagane minimum 2 rekordy')
    }

    const from = values[0]
    const to = values[values.length - 1]

    // @todo automatyczne określanie zakresu dni
    if (!isCompleteRecord(from) || !isCompleteRecord(to)) {
        throw new Error('Wybrane rekordy nie zawierają kompletnych danych')
    }

    const {
        days,
        totalYield,
        dailyYield,
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
        from,
        to,
        plantProperties,
    })

    const {
        savedCost,
        dailySaving,
        investmentReturnYears,
        investmentReturnMonths,
    } = calculateInvestment({
        days,
        savedEnergy,
        investmentCost: plantProperties.investmentCost,
        tariffItems: tariff,
    })
</script>

<div class="data">
    <Item
        label="Zakres danych"
        value={`${formatDate(from.date)} - ${formatDate(
            to.date
        )} (${days} dni)`}
    />
    <EnergyCountItem label="Uzysk" value={totalYield} />
    <EnergyCountItem label="Średni uzysk na dzień" value={dailyYield} />
    <Item label="kWh/kWp" value={formatNumber(kWhTokWp)} />

    <Item
        label="Autokonsumpcja"
        value={`${formatKwh(selfConsumed)} (${formatPercent(
            selfConsumedPercent
        )} produkcji)`}
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
            value={`Zapotrzebowanie na energię elektryczną jest spełnione w ${formatPercent(
                needsFulfilmentPercent
            )}`}
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
    .data {
        line-height: 1.4;
    }

    .beta {
        color: rgb(255, 52, 52);
        font-weight: 700;
    }
</style>
