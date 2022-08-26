import {
    IsInstance,
    IsInt,
    IsNumber,
    IsOptional,
    IsString,
    ValidateIf,
    ValidateNested,
} from 'class-validator'
import { Type } from 'class-transformer'
import { IsISO8601Date } from '../decorators/is-iso8601-date'
import { BaseMeterValuesRecord, BaseYieldValuesRecord } from './values-record'

// @todo walidacja: totalYield i/lub (charged i donated)
class MeterRecordInitialValuesValidationClass {
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
}

export class MeterRecord {
    @IsInt()
    id!: number

    @IsISO8601Date()
    installationDate!: string

    @IsInstance(MeterRecordInitialValuesValidationClass)
    @ValidateNested()
    @Type(() => MeterRecordInitialValuesValidationClass)
    initialValues!: BaseYieldValuesRecord | BaseMeterValuesRecord

    @IsOptional()
    @IsString()
    comment?: string
}
