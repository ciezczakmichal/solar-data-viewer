import dayjs, { type Dayjs } from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import { DateFormat } from 'schema'

dayjs.extend(customParseFormat)

export function parseDate(date: string | Dayjs): Dayjs {
    if (typeof date === 'string') {
        return dayjs(date, DateFormat, true)
    }

    return date
}

export function formatDate(date: Dayjs): string {
    return date.format(DateFormat)
}
