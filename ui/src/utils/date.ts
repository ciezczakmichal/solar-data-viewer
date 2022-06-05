import dayjs, { type Dayjs } from 'dayjs'

export function getMonthName(month: number): string {
    return dayjs.months()[month]
}

export function isLastDayOfMonth(date: Dayjs): boolean {
    return date.date() === date.daysInMonth()
}

export function getLastDayOfMonth(date: Dayjs): Dayjs {
    return date.date(date.daysInMonth())
}
