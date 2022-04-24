import {
    isCompleteRecord,
    type CompleteValuesRecord,
    type DataFormat,
} from 'format'
import { calculateEnergy, parseDate } from 'calculation'
import { getMonthName } from '../../utils/date'

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

export type ChartData = ChartDataItem[]

export function getChartData(
    data: DataFormat,
    options: ChartOptions
): ChartDataItem[] {
    const { type, range } = options
    let records = data.values.filter(item =>
        isCompleteRecord(item)
    ) as CompleteValuesRecord[]

    if (range === DataRange.Week) {
        records = records.filter(item => {
            // dane z niedzieli
            const date = parseDate(item.date)
            return date.day() === 0
        })
    } else {
        records = records.filter((item, index, array) => {
            // dane z ostatniego dnia miesiąca lub ostatni dzień pomiarowy
            const date = parseDate(item.date)
            const lastMonth = index + 1 >= array.length
            return date.date() === date.daysInMonth() || lastMonth
        })
    }

    const first = data.values[0]

    if (!isCompleteRecord(first)) {
        throw new Error('Oczekiwano pełnych danych w pierwszym rekordzie')
    }

    return records.map((item, index) => {
        const previousItem: CompleteValuesRecord | null =
            index > 0 ? records[index - 1] : null
        const date = parseDate(item.date)
        let label

        if (range === DataRange.Week) {
            const currentLabel = date.format('DD.MM')

            if (type === ChartType.Line) {
                label = currentLabel
            } else if (previousItem) {
                const previousLabel = parseDate(previousItem.date)
                    .add(1, 'day')
                    .format('DD.MM')
                label = `${previousLabel} - ${currentLabel}`
            } else {
                label = `do ${currentLabel}`
            }
        } else {
            label = getMonthName(date.month())
        }

        let from = first

        if (type === ChartType.Bar) {
            from = previousItem || from
        }

        const { fulfillNeeds, energyToCharge, energyToBuy } = calculateEnergy({
            from,
            to: item,
            plantProperties: data.plantProperties,
        })

        const value = fulfillNeeds ? energyToCharge : -1 * energyToBuy

        return {
            x: label,
            y: value,
        }
    })
}
