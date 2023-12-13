export interface BaseYieldValuesRecord {
    // uzysk - energia wyprodukowana
    totalYield: number
}

export interface BaseMeterValuesRecord {
    // energia pobrana z sieci
    charged: number

    // energia oddana do sieci
    donated: number
}

export type BaseCompleteValuesRecord = BaseYieldValuesRecord &
    BaseMeterValuesRecord
export type BaseValuesRecord =
    | BaseYieldValuesRecord
    | BaseMeterValuesRecord
    | BaseCompleteValuesRecord

export interface ValuesRecordProperties {
    meterId: number
    date: string
    comment?: string
}

export type YieldValuesRecord = ValuesRecordProperties & BaseYieldValuesRecord
export type MeterValuesRecord = ValuesRecordProperties & BaseMeterValuesRecord
export type CompleteValuesRecord = YieldValuesRecord & MeterValuesRecord

export type ValuesRecord =
    | YieldValuesRecord
    | MeterValuesRecord
    | CompleteValuesRecord

export type ValuesRecordNumberProps = 'totalYield' | 'charged' | 'donated'

export function isYieldRecord(
    data: ValuesRecordProperties,
): data is YieldValuesRecord {
    return 'totalYield' in data
}

export function isMeterRecord(
    data: ValuesRecordProperties,
): data is MeterValuesRecord {
    return 'charged' in data && 'donated' in data
}

export function isCompleteRecord(
    data: ValuesRecordProperties,
): data is CompleteValuesRecord {
    return isYieldRecord(data) && isMeterRecord(data)
}
