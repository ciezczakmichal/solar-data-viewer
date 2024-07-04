import dayjs, { type Dayjs } from 'dayjs'
import { DateFormat } from '../definitions/date-format.js'

export function parseDate(date: Dayjs | string): Dayjs {
    if (typeof date === 'string') {
        return dayjs(date, DateFormat, true)
    }

    return date
}

export function formatDate(date: Dayjs): string {
    return date.format(DateFormat)
}
