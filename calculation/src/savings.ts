import currency from 'currency.js'
import { Dayjs } from 'dayjs'
import { CompleteValuesRecord } from 'schema'
import {
    calculateEnergy,
    EnergyCalculationInputPlantProperties,
} from './energy'
import { calculateEnergyCost } from './energy-cost'
import { MetersDataHelper } from './meters-data-helper'
import { Tariff } from './tariff/tariff'
import { CurrencyZloty } from './utils/currency-zloty'
import { parseDate } from './utils/date'

export interface SavingsCalculationInput {
    values: CompleteValuesRecord[]
    plantProperties: EnergyCalculationInputPlantProperties

    // wymagany, gdyż pozwala uwzględnić dane początkowe licznika
    metersHelper: MetersDataHelper

    tariff: Tariff
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
    input: SavingsCalculationInput,
): SavingsCalculationResult {
    const { plantProperties, metersHelper, tariff } = input

    const initialValue = metersHelper.getMeterInitialValuesAsCompleteRecord(
        metersHelper.getFirstMeterId(),
    )
    const values = [initialValue, ...input.values]

    const daysOfChange = tariff.getValueChangeDatesForEnergyCost()

    let accurate = true
    let savings = new CurrencyZloty()

    let firstValue: CompleteValuesRecord | null = null
    let countedSavedEnergy = 0

    for (let i = 0; i < daysOfChange.length; i++) {
        const currentStart = daysOfChange[i]
        const nextStart =
            i + 1 < daysOfChange.length ? daysOfChange[i + 1] : null

        const valuesForRange = getValuesForRange(
            values,
            currentStart,
            nextStart,
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
            date: parseDate(to.date),
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

interface ValuesForRange {
    from: CompleteValuesRecord
    to: CompleteValuesRecord

    accurate: boolean
}

function getValuesForRange(
    values: CompleteValuesRecord[],
    currentStart: Dayjs,
    nextStart: Dayjs | null,
): ValuesForRange | null {
    // @todo parsowanie dat oraz reverse wartości - optymalizacja - tylko raz

    const currentStartFrom = currentStart.add(-1, 'day')
    const from = values.find(
        value => !parseDate(value.date).isBefore(currentStartFrom),
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
