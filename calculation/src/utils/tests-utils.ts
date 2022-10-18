import dayjs, { Dayjs } from 'dayjs'
import { DateFormat } from 'schema'
import { parseDate } from './date'

// miesiąc tak jak wyświetlany (czyli 1 = styczeń)
export function dayJsInstance(year: number, month: number, day: number): Dayjs {
    return dayjs(new Date(year, month - 1, day))
}

// miesiąc tak jak wyświetlany (czyli 1 = styczeń)
export function dayJsInstanceWithExtraProperty(
    year: number,
    month: number,
    day: number
): Dayjs {
    const instance = dayjs(new Date(year, month - 1, day))
    // sformatuj i parsuj - aby wewnętrzna reprezentacja obiektu się zgadzała
    // inaczej była różnica na właściwości "$x"
    return parseDate(instance.format(DateFormat))
}
