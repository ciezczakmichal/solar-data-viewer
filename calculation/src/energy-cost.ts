import currency from 'currency.js'
import { Dayjs } from 'dayjs'
import { TariffItem, TariffItemValue, VatRateItem } from 'schema'
import { CurrencyOptions } from './currency-options'
import { CalculationError } from './error'
import { parseDate } from './utils/date'

export interface EnergyCostCalculationInput {
    tariff: TariffItem[]
    vatRate: VatRateItem[]

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
    const { tariff, vatRate, from: fromAny, to: toAny, energy } = input
    const from = parseDate(fromAny)
    const to = parseDate(toAny)

    let result = currency(0, CurrencyOptions)
    const tariffValues: TariffItemValue[] = []

    if (tariff.length === 0) {
        throw new CalculationError('Brak elementów taryfy')
    }

    for (const item of tariff) {
        const itemValue = findAppropriateItemForRange(
            item.name,
            item.values,
            from,
            to
        )

        if (itemValue) {
            tariffValues.push(itemValue)
        }
    }

    if (tariffValues.length === 0) {
        throw new CalculationError(
            'Brak parametrów taryfy dla zadanego zakresu czasowego'
        )
    }

    for (const itemValue of tariffValues) {
        // biblioteka zastosuje zaokrąglenie do pełnych groszy
        result = result.add(itemValue.value * energy)
    }

    return addVatTax(result, vatRate, from, to)
}

interface BasicItem {
    from: string
}

function findAppropriateItemForRange<T extends BasicItem>(
    paramName: string,
    items: T[],
    from: Dayjs,
    to: Dayjs
): T | null {
    if (items.length === 0) {
        throw new CalculationError('Brak elementów taryfy')
    }

    const nextIndex = items.findIndex(item =>
        parseDate(item.from).isAfter(from)
    )

    if (nextIndex === -1) {
        // wszystkie parametry są młodsze niż data początku, weź ostatni
        return items[items.length - 1]
    }

    const nextItem = items[nextIndex]

    if (!to.isBefore(parseDate(nextItem.from))) {
        if (nextIndex === 0) {
            throw new CalculationError(
                `Zakres czasowy obejmuje okres, w którym brak wartości parametru "${paramName}"`
            )
        }

        throw new CalculationError(
            `Zakres czasowy obejmuje dzień zmiany wartości parametru "${paramName}"`
        )
    }

    if (nextIndex === 0) {
        return null
    }

    return items[nextIndex - 1]
}

function addVatTax(
    value: currency,
    vatRates: VatRateItem[],
    from: Dayjs,
    to: Dayjs
): currency {
    const vatRateItem = findAppropriateItemForRange(
        'stawka VAT',
        vatRates,
        from,
        to
    )

    if (!vatRateItem) {
        throw new CalculationError(
            'Brak stawki VAT dla zadanego zakresu czasowego'
        )
    }

    return value.multiply(1 + vatRateItem.value / 100)
}
