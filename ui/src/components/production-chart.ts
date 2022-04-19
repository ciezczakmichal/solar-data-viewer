import type { DataFormat, EnergyProducedInfo } from 'format'
import { parseDate } from 'calculation'
import { getMonthName } from '../utils/date'

export enum ChartType {
    Line,
    Bar,
}

export enum DataRange {
    Week,
    Month,
}

export interface ChartOptions {
    type: ChartType
    range: DataRange
}

export interface ChartDataItem {
    x: string
    y: number
}

export function getChartData(
    data: DataFormat,
    options: ChartOptions
): ChartDataItem[] {
    const { type, range } = options
    let valuesToUse: EnergyProducedInfo[] = []

    if (range === DataRange.Week) {
        valuesToUse = data.energyProduced.filter(item => {
            // dane z niedzieli
            const date = parseDate(item.date)
            return date.day() === 0
        })
    } else {
        valuesToUse = data.energyProduced.filter((item, index, array) => {
            // dane z ostatniego dnia miesiąca lub ostatni dzień pomiarowy
            const date = parseDate(item.date)
            const lastMonth = index + 1 >= array.length
            return date.date() === date.daysInMonth() || lastMonth
        })
    }

    return valuesToUse.map((item, index) => {
        const date = parseDate(item.date)
        let label, value

        if (range === DataRange.Week) {
            label = date.format('DD.MM')
        } else {
            label = getMonthName(date.month())
        }

        if (type === ChartType.Bar) {
            const previousValue = index > 0 ? valuesToUse[index - 1].value : 0
            value = item.value - previousValue
        } else {
            value = item.value
        }

        return {
            x: label,
            y: value,
        }
    })
}