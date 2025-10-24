import type { Dayjs } from 'dayjs'

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

export type BaseCompleteValuesRecord = BaseMeterValuesRecord &
    BaseYieldValuesRecord
export type BaseValuesRecord =
    | BaseCompleteValuesRecord
    | BaseMeterValuesRecord
    | BaseYieldValuesRecord

export interface ValuesRecordPropertiesSchema {
    meterId: number
    date: string
    comment?: string
}

export interface ValuesRecordProperties
    extends Omit<ValuesRecordPropertiesSchema, 'date'> {
    date: Dayjs
}

export type YieldValuesRecord = BaseYieldValuesRecord & ValuesRecordProperties
export type MeterValuesRecord = BaseMeterValuesRecord & ValuesRecordProperties
export type CompleteValuesRecord = MeterValuesRecord & YieldValuesRecord

export type ValuesRecord =
    | CompleteValuesRecord
    | MeterValuesRecord
    | YieldValuesRecord

export type ValuesRecordSchema = Omit<ValuesRecord, 'date'> & {
    date: string
}

export type ValuesRecordNumberProps = 'charged' | 'donated' | 'totalYield'

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
