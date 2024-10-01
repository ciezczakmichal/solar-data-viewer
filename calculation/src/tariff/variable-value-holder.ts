import type { Dayjs } from 'dayjs'
import type { DateRange } from '../utils/date-range.js'

export interface ValueItem {
    from: Dayjs
    value: number
}

/**
 * Klasa reprezentująca wartość zmienną w czasie.
 */
export class VariableValueHolder<T extends ValueItem> {
    constructor(protected _data: T[]) {}

    /**
     * Zwraca wartość pozycji taryfy dla zadanego dnia.
     * @param date Dzień, dla którego pobrać dane
     * @returns Wartość pozycji (netto - bez podatku)
     */
    valueForDate(date: Dayjs): null | number {
        const item = this.valueItemForDate(date)
        return item ? item.value : null
    }

    /**
     * Zwraca daty, w których następuje zmiana wartości pozycji taryfy.
     * @returns Tablica dat
     */
    valueChangeDates(): Dayjs[] {
        return this._data.map(item => item.from)
    }

    /**
     * Zwraca informację, czy wartość pozycji ulega zmianie w podanym zakresie dat.
     * Kontroli podlega sam fakt zmiany, niezależnie od rzeczywistej wartości.
     * Metoda zwróci false także w sytuacji, gdy dla zakresu brak jest wartości.
     * @param range Zakres dat do sprawdzenia
     * @returns Informacja, czy wartość ulega zmianie
     * @todo sprawdzać wartość pozycji gdy nowy element
     */
    changesWithinRange(range: DateRange): boolean {
        const { from, to } = range

        const fromItem = this.valueItemForDate(from)
        const toItem = this.valueItemForDate(to)

        return fromItem !== toItem
    }

    protected valueItemForDate(date: Dayjs): null | T {
        return (
            this._data.findLast(item => item.from.isSameOrBefore(date)) || null
        )
    }
}
