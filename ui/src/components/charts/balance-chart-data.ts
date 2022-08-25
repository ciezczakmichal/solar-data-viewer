import type { CompleteValuesRecord, SolarDataFormat } from 'format'
import { calculateEnergy, MetersDataHelper } from 'calculation'
import { getCompleteRecordsForRange } from '../../computation/records-for-range'
import {
    getChartData,
    type ChartDataItem,
    type ChartOptions,
} from '../../computation/chart-data'

export interface BalanceChartInput {
    from: CompleteValuesRecord
    data: SolarDataFormat
    metersHelper: MetersDataHelper
    options: ChartOptions
}

export type BalanceChartData = ChartDataItem[]

export function getBalanceChartData(
    input: BalanceChartInput
): BalanceChartData {
    const { from, data, metersHelper, options } = input
    const records = getCompleteRecordsForRange(data.values, options.range)

    return getChartData(
        from,
        records,
        options,
        (from: CompleteValuesRecord, to: CompleteValuesRecord) => {
            const { fulfillNeeds, energyToCharge, energyToBuy } =
                calculateEnergy({
                    from,
                    to,
                    plantProperties: data.plantProperties,
                    metersHelper,
                })

            return fulfillNeeds ? energyToCharge : -1 * energyToBuy
        }
    )
}
