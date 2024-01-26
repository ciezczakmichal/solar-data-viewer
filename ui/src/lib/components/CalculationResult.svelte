<script lang="ts">
    import { isCompleteRecord } from 'schema'
    import {
        calculateEnergy,
        calculateEnergyCostAtDay,
        calculateFixedCost,
        calculateInvestment,
        calculateSavings,
        type EnergyCalculationResult,
    } from 'calculation'
    import { getAppContext } from '$lib/global/app-context'
    import { getCompleteValueCloseToYear } from '$lib/computation/value-close-to-year'
    import {
        formatNumber,
        formatKwh,
        formatPercent,
    } from '$lib/utils/formatters/format-numbers'
    import {
        DurationFormatFlag,
        formatDate,
        formatDuration,
    } from '$lib/utils/formatters/format-time'
    import Item from './Item.svelte'
    import EnergyCountItem from './EnergyCountItem.svelte'

    const { data, from, to, metersHelper, tariff } = getAppContext()
    const { values, plantProperties } = data

    const rangeString = `${formatDate(from.date)} - ${formatDate(to.date)}`
    const durationString = formatDuration({ from: from.date, to: to.date })
    const daysRangeString = `${rangeString} (${durationString})`

    const {
        days,
        totalYield,
        dailyYield,
        kWhTokWp,
        selfConsumption,
        selfConsumptionPercent,
        donated,
        donatedToUse,
        charged,
        totalConsumption,
        dailyConsumption,
        monthlyConsumption,

        fulfillNeeds,
        savedEnergy,
        demandFulfillmentPercent,
        energyToBuy,
        energyToCharge,
    } = calculateEnergy({
        from,
        to,
        plantProperties,
        metersHelper,
    })

    const { accurate, savings } = calculateSavings({
        values: values.filter(isCompleteRecord),
        plantProperties,
        metersHelper,
        tariff,
    })

    const dailySaving = savings.divide(days)

    const currentEnergyCost = calculateEnergyCostAtDay(tariff, to.date)
    const currentFixedCost = calculateFixedCost(tariff, to.date)

    const valueCloseToYear = getCompleteValueCloseToYear(values)
    let lastYearCalculationResult: EnergyCalculationResult | null = null

    if (valueCloseToYear) {
        lastYearCalculationResult = calculateEnergy({
            from: valueCloseToYear,
            to,
            plantProperties,
            metersHelper,
        })
    }

    const { daysToInvestmentReturn } = calculateInvestment({
        plantProperties,
        savings,
        dailyEnergySavings: lastYearCalculationResult
            ? lastYearCalculationResult.savedEnergy /
              lastYearCalculationResult.days
            : savedEnergy / days,
        currentEnergyCost,
    })
</script>

<div class="data">
    <Item label="Zakres danych" value={daysRangeString} />
    <EnergyCountItem label="Uzysk" value={totalYield} />
    <EnergyCountItem label="Średni uzysk na dzień" value={dailyYield} />
    <Item label="kWh/kWp" value={formatNumber(kWhTokWp)} />

    <Item
        label="Autokonsumpcja"
        value={`${formatKwh(selfConsumption)} (${formatPercent(
            selfConsumptionPercent,
        )} uzysku)`}
    />
    <Item
        label="Energia oddana do sieci"
        value={`${formatKwh(donated)} (= do pobrania ${formatKwh(
            donatedToUse,
        )})`}
    />

    <EnergyCountItem label="Energia pobrana z sieci" value={charged} />
    <EnergyCountItem
        label="Całkowite zużycie energii"
        value={totalConsumption}
    />
    <Item
        label="Średnie zużycie energii"
        value={`${formatKwh(dailyConsumption)} / dzień, ${formatKwh(
            monthlyConsumption,
        )} / miesiąc`}
    />
    {#if lastYearCalculationResult}
        <Item
            label="Średnie zużycie energii (12 mies.)"
            value={`${formatKwh(
                lastYearCalculationResult.dailyConsumption,
            )} / dzień, ${formatKwh(
                lastYearCalculationResult.monthlyConsumption,
            )} / miesiąc`}
        />
    {/if}
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
                demandFulfillmentPercent,
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

    <Item label="Bieżąca cena energii" value={currentEnergyCost} unit="/ kWh" />
    <Item
        label="Bieżące opłaty stałe"
        value={currentFixedCost}
        unit="/ miesiąc"
    />

    <br />

    <Item
        label="Oszczędności na rachunkach za prąd"
        value={savings}
        unit={!accurate ? '(dane przybliżone)' : undefined}
    />
    <Item label="Średnia kwota oszczędności na dzień" value={dailySaving} />
    <Item
        label="Przybliżony pozostały czas do zwrotu inwestycji"
        value={formatDuration(
            daysToInvestmentReturn,
            DurationFormatFlag.OmitDays,
        )}
    />
</div>

<style>
    .data {
        line-height: 1.4;
    }
</style>
