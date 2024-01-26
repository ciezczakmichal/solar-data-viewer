import type { Dayjs } from 'dayjs'
import {
    isCompleteRecord,
    type CompleteValuesRecord,
    type ValuesRecord,
} from 'schema'

/**
 * Zwraca wartość posiadającą komplet danych, która datowana jest na rok wcześniej
 * niż najnowsza kompletna wartość przekazanego zestawu danych (tj. ostatnia wartość tablicy).
 * Funkcja wykazuje 1 miesiąc tolerancji przy wskazaniu danych.
 * Funkcja zwróci NULL, jeśli dane nie obejmują rocznego zakresu, lub założona tolerancja
 * nie pozwala na wskazanie rekordu.
 *
 * @param values Wartości odczytów, z których zostanie wybrana wartość
 * @returns Kompletna wartość odczytów sprzed roku lub null, jeśli wartości nie można wskazać.
 */
export function getCompleteValueCloseToYear(
    values: ValuesRecord[],
): CompleteValuesRecord | null {
    let lastValue: CompleteValuesRecord | null = null
    let lastValueDate: Dayjs | null = null

    let result: CompleteValuesRecord | null = null
    let daysDiff = Number.MAX_SAFE_INTEGER

    for (let i = values.length - 1; i >= 0; i--) {
        const value = values[i]

        if (!isCompleteRecord(value)) {
            continue
        }

        if (lastValue === null) {
            lastValue = value
            lastValueDate = lastValue.date
            continue
        }

        // problemy TS
        const lastDateCasted = lastValueDate as unknown as Dayjs

        const currentDaysDiff = Math.abs(
            365 - lastDateCasted.diff(value.date, 'days'),
        )

        if (currentDaysDiff <= 30 && currentDaysDiff < daysDiff) {
            result = value
            daysDiff = currentDaysDiff
        } else if (currentDaysDiff > daysDiff) {
            break
        }
    }

    return result
}
