import currency from 'currency.js'
import { Dayjs } from 'dayjs'
import { CurrencyOptions } from './currency-options'
import { CalculationError } from './error'
import { TimeVaryingValuesHelper } from './time-varying-values-helper'
import { parseDate } from './utils/date'
import { Month } from './utils/month'

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
 * Uwzględniane są wyłącznie opłaty zmienne, zależne od ilości energii.
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

    const rate = timeVaryingHelper.getVatTaxRate(from, to)
    let result = currency(0, CurrencyOptions)

    for (const itemValue of tariffValues) {
        // biblioteka zastosuje zaokrąglenie do pełnych groszy
        result = result.add(itemValue.value * energy)
    }

    return addVatTax(result, rate)
}

/**
 * Zwraca koszt zakupu 1 kWh energii w podanym dniu.
 * Uwzględniane są wyłącznie opłaty zmienne, zależne od ilości energii.
 * @see calculateEnergyCost()
 * @param timeVaryingHelper Obiekt pomocniczy, dostarczający dane o taryfie i stawce VAT
 * @param date Dzień, dla którego wyliczyć dane
 * @returns Koszt zakupu energii
 */
export function calculateEnergyCostAtDay(
    timeVaryingHelper: TimeVaryingValuesHelper,
    date: string | Dayjs
): currency {
    const day = parseDate(date)

    return calculateEnergyCost({
        timeVaryingHelper,
        from: day,
        to: day,
        energy: 1,
    })
}

/**
 * Zwraca kwotę opłat stałych za prąd (niezależnych od ilości pobranej energii) ponoszonych
 * we wskazanym miesiącu.
 * @param timeVaryingHelper Obiekt pomocniczy, dostarczający dane o taryfie i stawce VAT
 * @param month Miesiąc, dla którego pobrać dane
 * @returns Kwota opłat stałych w miesiącu
 * @todo testy jednostkowe - na wzór calculateEnergyCost()
 */
export function calculateFixedCost(
    timeVaryingHelper: TimeVaryingValuesHelper,
    month: Month
): currency {
    const tariffValues = timeVaryingHelper.getTariffValuesForFixedCost(month)

    if (tariffValues.length === 0) {
        throw new CalculationError(
            'Brak parametrów pozycji taryfy dla wskazanego miesiąca'
        )
    }

    const rate = timeVaryingHelper.getVatTaxRate(month.lastDayOfMonth())
    let result = currency(0, CurrencyOptions)

    for (const itemValue of tariffValues) {
        // biblioteka zastosuje zaokrąglenie do pełnych groszy
        result = result.add(itemValue.value)
    }

    return addVatTax(result, rate)
}

function addVatTax(value: currency, rate: number): currency {
    return value.multiply(1 + rate / 100)
}
