import type { CompleteValuesRecord, SolarData } from 'schema'
import { calculateEnergy, MetersDataHelper } from 'calculation'
import { getCompleteRecordsForRange } from '../../computation/records-for-range'
import {
    getChartData,
    type ChartDataItem,
    type ChartOptions,
} from '../../computation/chart-data'

export interface ConsumptionChartInput {
    from: CompleteValuesRecord
    data: SolarData
    metersHelper: MetersDataHelper
    options: ChartOptions
}

export interface ConsumptionChartData {
    chargedEnergyData: ChartDataItem[]
    selfConsumptionData: ChartDataItem[]
}

interface CalculationReturnType {
    charged: number
    selfConsumed: number
}

export function getConsumptionChartData(
    input: ConsumptionChartInput
): ConsumptionChartData {
    const { from, data, metersHelper, options } = input
    const records = getCompleteRecordsForRange(data.values, options.range)

    const chartData = getChartData<CalculationReturnType, CompleteValuesRecord>(
        from,
        records,
        options,
        ({ from, to }) => {
            const { charged, selfConsumed } = calculateEnergy({
                from,
                to,
                plantProperties: data.plantProperties,
                metersHelper,
            })

            return { charged, selfConsumed }
        }
    )

    return {
        chargedEnergyData: chartData.map(item => ({
            x: item.x,
            y: item.charged,
        })),
        selfConsumptionData: chartData.map(item => ({
            x: item.x,
            y: item.selfConsumed,
        })),
    }
}
