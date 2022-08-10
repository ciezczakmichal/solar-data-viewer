import currency from 'currency.js'
import { Dayjs } from 'dayjs'
import { TariffItem, VatRateItem, CompleteValuesRecord } from 'format'
import { CalculationError } from './error'
import {
    calculateEnergy,
    EnergyCalculationInputPlantProperties,
} from './energy'
import { calculateEnergyCost } from './energy-cost'
import { CurrencyOptions } from './currency-options'
import { MetersDataHelper } from './meters-data-helper'
import { parseDate } from './utils/date'

export interface SavingsCalculationInput {
    values: CompleteValuesRecord[]
    tariff: TariffItem[]
    vatRate: VatRateItem[]
    plantProperties: EnergyCalculationInputPlantProperties

    // wymagany, gdyż pozwala uwzględnić dane początkowe licznika
    metersHelper: MetersDataHelper
}

export interface SavingsCalculationResult {
    // true, jeśli wynik jest dokładny, tzn. dane źródłowe idealnie pasują do dni zmiany taryfy
    accurate: boolean

    savings: currency
}

/**
 * Zwraca kwotę oszczędności na rachunku dzięki instalacji.
 * Oblicza w tym celu cenę prądu, który został zbilansowany pracą instalacji, w poszczególnych okresach taryfowych,
 * a następnie sumuje uzyskane kwoty.
 * @param input Dane niezbędne do obliczenia oszczędności
 * @returns Kwota oszczędności
 */
export function calculateSavings(
    input: SavingsCalculationInput
): SavingsCalculationResult {
    const { tariff, vatRate, plantProperties, metersHelper } = input

    const initialValue = metersHelper.getMeterInitialValuesAsCompleteRecord(
        metersHelper.getFirstMeterId()
    )
    let values = [initialValue, ...input.values]

    const daysOfChange = getDaysOfChange(tariff, vatRate)
    let accurate = true
    let savings = currency(0, CurrencyOptions)

    let firstValue: CompleteValuesRecord | null = null
    let countedSavedEnergy = 0

    for (let i = 0; i < daysOfChange.length; i++) {
        const currentStart = daysOfChange[i]
        const nextStart =
            i + 1 < daysOfChange.length ? daysOfChange[i + 1] : null

        const valuesForRange = getValuesForRange(
            values,
            currentStart,
            nextStart
        )

        if (!valuesForRange) {
            continue
        }

        /*
         * Liczymy ilość zaoszczędzonej energii na danych od samego początku.
         * Wynika to z tego, że część energii wyprodukowanej może stanowić nadwyżkę, która jest
         * możliwa do zużycia w późniejszym okresie.
         */

        const { from, to, accurate: rangeAccurate } = valuesForRange
        firstValue = firstValue || from

        const { savedEnergy } = calculateEnergy({
            from: firstValue,
            to,
            plantProperties,
            metersHelper,
        })

        const savedEnergyAtRange = savedEnergy - countedSavedEnergy
        countedSavedEnergy = savedEnergy

        const rangeSavings = calculateEnergyCost({
            tariff,
            vatRate,
            from: parseDate(from.date).add(1, 'day'), // from dla funkcji zawiera się w zakresie
            to: to.date,
            energy: savedEnergyAtRange,
        })

        accurate = accurate && rangeAccurate
        savings = savings.add(rangeSavings)
    }

    return {
        accurate,
        savings,
    }
}

function getDaysOfChange(
    tariff: TariffItem[],
    vatRate: VatRateItem[]
): Dayjs[] {
    const daysOfChangeSet = new Set<string>()

    for (const item of tariff) {
        for (const value of item.values) {
            daysOfChangeSet.add(value.from)
        }
    }

    for (const item of vatRate) {
        daysOfChangeSet.add(item.from)
    }

    const daysOfChange = [...daysOfChangeSet.values()]
        .map(parseDate)
        .sort((a, b) => (a.isBefore(b) ? -1 : 1))

    if (daysOfChange.length === 0) {
        throw new CalculationError('Tablica parametrów jest pusta')
    }

    return daysOfChange
}

interface ValuesForRange {
    from: CompleteValuesRecord
    to: CompleteValuesRecord

    accurate: boolean
}

function getValuesForRange(
    values: CompleteValuesRecord[],
    currentStart: Dayjs,
    nextStart: Dayjs | null
): ValuesForRange | null {
    // @todo parsowanie dat oraz reverse wartości - optymalizacja - tylko raz

    const currentStartFrom = currentStart.add(-1, 'day')
    const from = values.find(
        value => !parseDate(value.date).isBefore(currentStartFrom)
    )

    if (!from) {
        return null
    }

    const lastValue = values[values.length - 1]
    let to: CompleteValuesRecord = lastValue

    if (nextStart) {
        const foundTo = [...values]
            .reverse()
            .find(value => parseDate(value.date).isBefore(nextStart))

        if (foundTo) {
            to = foundTo
        }
    }

    const fromAccurate =
        from === values[0] || parseDate(from.date).isSame(currentStartFrom)
    const toAccurate =
        to === lastValue ||
        !nextStart || // ten test tak naprawdę pokryty przez powyższe porównanie
        parseDate(to.date).isSame(nextStart.add(-1, 'day'))
    const accurate = fromAccurate && toAccurate

    return {
        from,
        to,
        accurate,
    }
}
