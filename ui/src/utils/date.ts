import dayjs from 'dayjs'

export function getMonthName(month: number): string {
    return dayjs.months()[month]
}
