import dayjs, { Dayjs } from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import { DateFormat } from 'format'

dayjs.extend(customParseFormat)

export function parseDate(date: string): Dayjs
export function parseDate(date: string, format: string): Dayjs
export function parseDate(date: string, format?: string): Dayjs {
    return dayjs(date, format || DateFormat, true)
}
