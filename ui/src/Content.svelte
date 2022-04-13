<script lang="ts">
    import type { DataFormat } from 'format'
    import { calculateEnergy, calculateInvestment } from 'calculation'
    import Item from './Item.svelte'
    import { format } from './utils'

    export let url: string
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
    <Item label="Źródło danych" value={url} />
    <br />

    <Item label="Czas pracy instalacji" value={days} unit="dni" />
    <Item label="Energia wyprodukowana" value={produced} unit="kWh" />
    <Item
        label="Średnia dzienna produkcja energii"
        value={format(dailyProduction)}
        unit="kWh"
    />
    <Item label="kWh/kWp" value={format(kWhTokWp)} />

    <Item
        label="Autokonsumpcja"
        value={`${selfConsumed} kWh (${selfConsumedPercent} produkcji)`}
    />
    <Item
        label="Oddano do sieci"
        value={`${donated} kWh (= do pobrania ${format(donatedToUse)} kWh)`}
    />

    <Item label="Pobrano energii z sieci" value={charged} unit="kWh" />
    <Item
        label="Całkowite zużycie energii"
        value={totalConsumption}
        unit="kWh"
    />
    <Item
        label="Średnie dzienne zużycie energii"
        value={format(dailyConsumption)}
        unit="kWh"
    />
    <br />

    {#if fulfillNeeds}
        <Item
            label="WYNIK"
            value="Ilość wyprodukowanej energii wystarcza do pokrycia potrzeb, posiadana nadwyżka."
        />
        <Item
            label="Ilość energii pozostała w magazynie do pobrania"
            value={energyToCharge}
            unit="kWh"
        />
    {:else}
        <Item
            label="WYNIK"
            value="Ilość wyprodukowanej energii nie wystarcza do pokrycia potrzeb."
        />
        <Item
            value={`Potrzeby na prąd spełnione w ${needsFulfilmentPercent}`}
        />
        <Item
            label="Ilość energii pozostała do rozliczenia (zapłaty)"
            value={format(energyToBuy)}
            unit="kWh"
        />
    {/if}

    <Item
        value={`Gdyby nie panele, trzeba by zapłacić za ${format(
            savedEnergy
        )} kWh energii`}
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
