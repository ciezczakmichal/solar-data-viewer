import type { Dayjs } from 'dayjs'
import currency from 'currency.js'
import { CalculationError } from './error.js'
import { Tariff } from './tariff/tariff.js'
import { CurrencyZloty } from './utils/currency-zloty.js'

export interface EnergyCostCalculationInput {
    tariff: Tariff
    date: Dayjs

    // wartość energii pobranej (kWh)
    energy: number
}

/**
 * Zwraca koszt pobrania (zakupu) podanej ilości energii przy użyciu taryfy we wskazanym dniu.
 * Uwzględniane są wyłącznie opłaty zmienne, zależne od ilości energii.
 * W celu obliczenia kosztu potrzebny jest minimum jeden parametr taryfy oraz stawka VAT.
 * @param input Dane niezbędne do obliczenia kosztu
 * @returns Koszt zakupu energii
 */
export function calculateEnergyCost(
    input: EnergyCostCalculationInput,
): currency {
    const { tariff, date, energy } = input
    const tariffValues = tariff.getValuesForEnergyCost(date)

    if (tariffValues.length === 0) {
        throw new CalculationError(
            'Brak parametrów pozycji taryfy dla zadanego zakresu czasowego',
        )
    }

    const rate = tariff.getVatTaxRate(date)
    let result = new CurrencyZloty()

    for (const value of tariffValues) {
        // biblioteka zastosuje zaokrąglenie do pełnych groszy
        result = result.add(value * energy)
    }

    return addVatTax(result, rate)
}

/**
 * Zwraca koszt zakupu 1 kWh energii w podanym dniu.
 * Uwzględniane są wyłącznie opłaty zmienne, zależne od ilości energii.
 * @see calculateEnergyCost()
 * @param tariff Dane dotyczące taryfy i stawki VAT
 * @param date Dzień, dla którego obliczyć dane
 * @returns Koszt zakupu energii
 */
export function calculateEnergyCostAtDay(
    tariff: Tariff,
    date: Dayjs,
): currency {
    return calculateEnergyCost({ tariff, date, energy: 1 })
}

/**
 * Zwraca kwotę opłat stałych za prąd (niezależnych od ilości pobranej energii) przy użyciu taryfy we wskazanym dniu.
 * W celu obliczenia kosztu potrzebny jest minimum jeden parametr taryfy oraz stawka VAT.
 * @param tariff Dane dotyczące taryfy i stawki VAT
 * @param date Dzień, dla którego obliczyć dane
 * @returns Kwota opłat stałych w miesiącu
 * @todo testy jednostkowe - na wzór calculateEnergyCost()
 */
export function calculateFixedCost(tariff: Tariff, date: Dayjs): currency {
    const tariffValues = tariff.getValuesForFixedCost(date)

    if (tariffValues.length === 0) {
        throw new CalculationError(
            'Brak parametrów pozycji taryfy dla wskazanego miesiąca',
        )
    }

    const rate = tariff.getVatTaxRate(date)
    let result = new CurrencyZloty()

    for (const value of tariffValues) {
        // biblioteka zastosuje zaokrąglenie do pełnych groszy
        result = result.add(value)
    }

    return addVatTax(result, rate)
}

function addVatTax(value: currency, rate: number): currency {
    return value.multiply(1 + rate / 100)
}
