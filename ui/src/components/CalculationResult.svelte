<script lang="ts">
    import { isCompleteRecord, type DataFormat } from 'format'
    import {
        calculateEnergy,
        calculateInvestment,
        calculateSavings,
    } from 'calculation'
    import Item from './Item.svelte'
    import EnergyCountItem from './EnergyCountItem.svelte'
    import {
        formatNumber,
        formatKwh,
        formatPercent,
        formatDate,
        formatDuration,
        DurationFormatFlag,
    } from '../utils/format'

    export let data: DataFormat
    const { values, plantProperties, tariff, vatRate } = data

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

    // @todo użyć accurate
    const { savings } = calculateSavings({
        values: values.filter(isCompleteRecord),
        tariff,
        vatRate,
        plantProperties,
    })

    const { dailySaving, currentSavingsPerKwh, daysToInvestmentReturn } =
        calculateInvestment({
            lastValueDate: values[values.length - 1].date,
            tariff,
            vatRate,
            plantProperties,
            days,
            savings,
            savedEnergy,
        })
</script>

<div class="data">
    <Item
        label="Zakres danych"
        value={`${formatDate(from.date)} - ${formatDate(
            to.date
        )} (${formatDuration(days)})`}
    />
    <EnergyCountItem label="Uzysk" value={totalYield} />
    <EnergyCountItem label="Średni uzysk na dzień" value={dailyYield} />
    <Item label="kWh/kWp" value={formatNumber(kWhTokWp)} />

    <Item
        label="Autokonsumpcja"
        value={`${formatKwh(selfConsumed)} (${formatPercent(
            selfConsumedPercent
        )} uzysku)`}
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
            label="Ilość energii do pobrania (uwzględniając współczynnik)"
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
            label="Ilość energii pozostała do rozliczenia (zakupu)"
            value={energyToBuy}
        />
    {/if}

    <Item
        label="Ilość energii, której zakupu zdołano uniknąć"
        value={formatKwh(savedEnergy)}
    />

    <br />

    <Item
        label="Oszczędność na rachunkach dzięki instalacji"
        value={savings.format()}
    />
    <Item
        label="Średnia kwota oszczędności na dzień"
        value={dailySaving.format()}
    />
    <Item
        label="Oszczędność wg bieżących cen energii"
        value={currentSavingsPerKwh.format()}
        unit="/ 1 kWh"
    />
    <Item
        label="Pozostały czas do zwrotu inwestycji"
        value={formatDuration(
            daysToInvestmentReturn,
            DurationFormatFlag.OmitDays
        )}
    />
</div>

<style>
    .data {
        line-height: 1.4;
    }
</style>
