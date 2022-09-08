import { IsNumber, IsOptional, IsString, ValidateIf } from 'class-validator'
import { IsISO8601Date } from '../decorators/is-iso8601-date'

// @todo walidacja: totalYield i/lub (charged i donated)
export class ValuesRecordValidationClass {
    @IsNumber()
    meterId!: number

    @IsISO8601Date()
    date!: string

    // uzysk - energia wyprodukowana
    @ValidateIf(
        data => data.charged === undefined || data.donated === undefined
    )
    @IsOptional()
    @IsNumber()
    totalYield?: number

    // energia pobrana z sieci
    @ValidateIf(data => data.totalYield === undefined)
    @IsOptional()
    @IsNumber()
    charged?: number

    // energia oddana do sieci
    @ValidateIf(data => data.totalYield === undefined)
    @IsOptional()
    @IsNumber()
    donated?: number

    @IsOptional()
    @IsString()
    comment?: string
}

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
    data: ValuesRecordProperties
): data is YieldValuesRecord {
    return 'totalYield' in data
}

export function isMeterRecord(
    data: ValuesRecordProperties
): data is MeterValuesRecord {
    return 'charged' in data && 'donated' in data
}

export function isCompleteRecord(
    data: ValuesRecordProperties
): data is CompleteValuesRecord {
    return isYieldRecord(data) && isMeterRecord(data)
}
