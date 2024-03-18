import dayjs, { Dayjs } from 'dayjs'
import { parseDate } from 'schema'
import { DateRange } from './date-range.js'

export class Month {
    private year!: number

    // wartości 0-11
    private month!: number

    constructor(date: string | Dayjs)
    constructor(year: number, month: number)
    constructor(dateOrYear: string | Dayjs | number, month?: number) {
        this.setMonth(dateOrYear, month)
    }

    firstDayOfMonth(): Dayjs {
        return dayjs(new Date(this.year, this.month, 1))
    }

    lastDayOfMonth(): Dayjs {
        const day = this.firstDayOfMonth()
        return day.date(day.daysInMonth())
    }

    /**
     * Zwraca obiekt reprezentujący zakres dni od początku do końcu miesiąca.
     * @returns Obiekt reprezentujący zakres dni
     */
    asDateRange(): DateRange {
        return {
            from: this.firstDayOfMonth(),
            to: this.lastDayOfMonth(),
        }
    }

    private setMonth(
        dateOrYear: string | Dayjs | number,
        month?: number,
    ): void {
        if (typeof dateOrYear === 'number') {
            if (month !== undefined) {
                this.year = dateOrYear
                this.month = month
            }
        } else {
            const date = parseDate(dateOrYear)
            this.year = date.year()
            this.month = date.month()
        }
    }
}
