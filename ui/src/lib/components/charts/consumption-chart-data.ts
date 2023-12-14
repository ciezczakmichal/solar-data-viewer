import { MetersDataHelper, calculateEnergy } from 'calculation'
import type { CompleteValuesRecord, SolarData } from 'schema'
import {
    getChartData,
    type ChartDataItem,
    type ChartOptions,
} from '../../computation/chart-data'
import { getCompleteRecordsForRange } from '../../computation/records-for-range'

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
    selfConsumption: number
}

export function getConsumptionChartData(
    input: ConsumptionChartInput,
): ConsumptionChartData {
    const { from, data, metersHelper, options } = input
    const records = getCompleteRecordsForRange(data.values, options.range)

    const chartData = getChartData<CalculationReturnType, CompleteValuesRecord>(
        from,
        records,
        options,
        ({ from, to }) => {
            const { charged, selfConsumption } = calculateEnergy({
                from,
                to,
                plantProperties: data.plantProperties,
                metersHelper,
            })

            return { charged, selfConsumption }
        },
    )

    return {
        chargedEnergyData: chartData.map(item => ({
            x: item.x,
            y: item.charged,
        })),
        selfConsumptionData: chartData.map(item => ({
            x: item.x,
            y: item.selfConsumption,
        })),
    }
}
