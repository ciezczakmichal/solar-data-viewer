import dayjs, { type Dayjs } from 'dayjs'
import { DateFormat } from 'schema'

export function parseDate(date: string | Dayjs): Dayjs {
    if (typeof date === 'string') {
        return dayjs(date, DateFormat, true)
    }

    return date
}

export function formatDate(date: Dayjs): string {
    return date.format(DateFormat)
}
