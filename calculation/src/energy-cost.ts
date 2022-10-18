import currency from 'currency.js'
import { Dayjs } from 'dayjs'
import { CurrencyOptions } from './currency-options'
import { CalculationError } from './error'
import { TimeVaryingValuesHelper } from './time-varying-values-helper'
import { parseDate } from './utils/date'

export interface EnergyCostCalculationInput {
    timeVaryingHelper: TimeVaryingValuesHelper

    // pierwszy dzień poboru energii
    from: string | Dayjs

    // ostatni dzień poboru energii
    to: string | Dayjs

    // wartość energii pobranej (kWh)
    energy: number
}

/**
 * Zwraca koszt pobrania (zakupu) podanej ilości energii w określonym zakresie czasowym.
 * Zakres czasowy nie może obejmować dnia zmiany lub wprowadzenia wartości taryfy (w takiej sytuacji jest rzucany wyjątek),
 * gdyż funkcja nie ma informacji jaką część energii obliczać poszczególnymi parametrami.
 * W celu obliczenia kosztu potrzebny jest minimum jeden parametr taryfy oraz stawka VAT.
 * @param input Dane niezbędne do obliczenia kosztu
 * @returns Koszt zakupu energii
 */
export function calculateEnergyCost(
    input: EnergyCostCalculationInput
): currency {
    const { timeVaryingHelper, from: inputFrom, to: inputTo, energy } = input
    const from = parseDate(inputFrom)
    const to = parseDate(inputTo)

    const tariffValues = timeVaryingHelper.getTariffValuesForEnergyCost(
        from,
        to
    )

    if (tariffValues.length === 0) {
        throw new CalculationError(
            'Brak parametrów pozycji taryfy dla zadanego zakresu czasowego'
        )
    }

    const rate = timeVaryingHelper.getVatTaxValue(from, to)
    let result = currency(0, CurrencyOptions)

    for (const itemValue of tariffValues) {
        // biblioteka zastosuje zaokrąglenie do pełnych groszy
        result = result.add(itemValue.value * energy)
    }

    return addVatTax(rate, result)
}

function addVatTax(rate: number, value: currency): currency {
    return value.multiply(1 + rate / 100)
}
