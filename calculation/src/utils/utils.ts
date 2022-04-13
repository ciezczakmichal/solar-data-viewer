import dayjs, { Dayjs } from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'

dayjs.extend(customParseFormat)

export function parseDate(date: string, format: string): Dayjs {
    return dayjs(date, format, true)
}

export function makePercent(value: number, total: number): string {
    return ((value / total) * 100).toFixed(2) + '%'
}
