import dayjs, { Dayjs } from 'dayjs'
import { formatDate, parseDate } from 'schema'

// miesiąc tak jak wyświetlany (czyli 1 = styczeń)
export function dayJsDate(year: number, month: number, day: number): Dayjs {
    return dayjs(new Date(year, month - 1, day))
}

/**
 * Miesiąc tak jak wyświetlany (czyli 1 = styczeń).
 *
 * Wersja funkcji dayJsDate() dodająca do wewnętrznej reprezentacji danych dodatkową właściwość "$x",
 * która skutkowała różnicami przy porównywaniu obiektów w testach jednostkowych.
 */
export function dayJsDateWithProperty(
    year: number,
    month: number,
    day: number,
): Dayjs {
    const instance = dayjs(new Date(year, month - 1, day))
    return parseDate(formatDate(instance))
}
