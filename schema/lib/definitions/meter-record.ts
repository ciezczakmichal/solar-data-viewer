import type { Dayjs } from 'dayjs'
import type { BaseValuesRecord } from './values-record.js'

export interface MeterRecordSchema {
    id: number
    installationDate: string
    initialValues: BaseValuesRecord
    comment?: string
}

export interface MeterRecord extends Omit<
    MeterRecordSchema,
    'installationDate'
> {
    installationDate: Dayjs
}
