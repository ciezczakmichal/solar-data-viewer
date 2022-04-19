import type { DataFormat, EnergyProducedInfo } from 'format'
import { parseDate } from 'calculation'
import { getMonthName } from '../utils/date'

// export enum GraphType {
//     Line,
// }

export enum DataRange {
    Week,
    Month,
}

export interface ChartDataItem {
    x: string
    y: number
}

export function getChartData(
    data: DataFormat,
    range: DataRange
): ChartDataItem[] {
    let valuesToUse: EnergyProducedInfo[] = []

    if (range === DataRange.Week) {
        valuesToUse = data.energyProduced.filter(item => {
            // dane z niedzieli
            const date = parseDate(item.date)
            return date.day() === 0
        })
    } else {
        valuesToUse = data.energyProduced.filter(item => {
            // dane z ostatniego dnia miesiąca
            const date = parseDate(item.date)
            return date.date() === date.daysInMonth()
        })
    }

    return valuesToUse.map(item => {
        const date = parseDate(item.date)
        let label

        if (range === DataRange.Week) {
            label = date.format('DD.MM')
        } else {
            label = getMonthName(date.month())
        }

        return {
            x: label,
            y: item.value,
        }
    })
}
