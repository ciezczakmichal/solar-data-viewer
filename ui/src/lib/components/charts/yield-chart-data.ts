import type { Dayjs } from 'dayjs'
import type { SolarData, YieldValuesRecord } from 'schema'
import { calculateBaseEnergyParams, type MetersDataHelper } from 'calculation'
import {
    type ChartDataItem,
    type ChartOptions,
    ChartType,
    getChartData,
} from '../../computation/chart-data'
import {
    DataRange,
    getYieldRecordsForRange,
} from '../../computation/records-for-range'

export interface YieldChartInput {
    from: YieldValuesRecord
    data: SolarData
    metersHelper: MetersDataHelper
    options: ChartOptions
}

export interface YieldChartData {
    yieldData: ChartDataItem[]
    yieldForecastData: ChartDataItem[]
}

interface CalculationReturnType {
    totalYield: number
    forecastedYield: null | number
}

interface ForecastFunctionFactoryResult {
    fn: (date: Dayjs) => null | number
    useForecastedData: boolean
}

function createForecastedValueFunction(
    options: ChartOptions,
    data: SolarData,
): ForecastFunctionFactoryResult {
    if (
        options.type === ChartType.Bar &&
        options.range === DataRange.Month &&
        data.yieldForecast
    ) {
        return {
            fn: date => {
                const item = (data.yieldForecast || []).find(
                    forecastItem => forecastItem.month === date.month() + 1,
                )

                return item?.value || null
            },
            useForecastedData: true,
        }
    } else {
        return {
            fn: () => null,
            useForecastedData: false,
        }
    }
}

export function getYieldChartData(input: YieldChartInput): YieldChartData {
    const { from, data, metersHelper, options } = input
    const records = getYieldRecordsForRange(data.values, options.range)

    const { fn: getForecastedValue, useForecastedData } =
        createForecastedValueFunction(options, data)

    const chartData = getChartData<CalculationReturnType, YieldValuesRecord>(
        from,
        records,
        options,
        ({ from, to, date }) => {
            const { totalYield } = calculateBaseEnergyParams({
                from,
                to,
                metersHelper,
            })

            const forecastedYield = getForecastedValue(date)
            return { totalYield, forecastedYield }
        },
    )

    return {
        yieldData: chartData.map(item => ({
            x: item.x,
            y: item.totalYield,
        })),
        yieldForecastData: !useForecastedData
            ? []
            : chartData.map(item => ({
                  x: item.x,
                  y: item.forecastedYield,
              })),
    }
}
