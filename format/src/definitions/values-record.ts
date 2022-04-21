import { IsNumber, IsOptional, IsString, ValidateIf } from 'class-validator'
import { IsISO8601Date } from '../decorators/is-iso8601-date'

// @todo walidacja: totalYield i/lub (charged i donated)
export class ValuesRecordValidationClass {
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

export interface BaseValuesRecord {
    date: string
    comment?: string
}

export interface YieldValuesRecord extends BaseValuesRecord {
    totalYield: number
}

export interface MeterValuesRecord extends BaseValuesRecord {
    charged: number
    donated: number
}

export type CompleteValuesRecord = YieldValuesRecord & MeterValuesRecord

export type ValuesRecord =
    | YieldValuesRecord
    | MeterValuesRecord
    | CompleteValuesRecord

export function isYieldRecord(
    data: BaseValuesRecord
): data is YieldValuesRecord {
    return 'totalYield' in data
}

export function isMeterRecord(
    data: BaseValuesRecord
): data is MeterValuesRecord {
    return 'charged' in data && 'donated' in data
}

export function isCompleteRecord(
    data: BaseValuesRecord
): data is CompleteValuesRecord {
    return isYieldRecord(data) && isMeterRecord(data)
}
