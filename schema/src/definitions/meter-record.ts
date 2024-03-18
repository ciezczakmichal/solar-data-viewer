import { Dayjs } from 'dayjs'
import { BaseValuesRecord } from './values-record.js'

export interface MeterRecordSchema {
    id: number
    installationDate: string
    initialValues: BaseValuesRecord
    comment?: string
}

export interface MeterRecord
    extends Omit<MeterRecordSchema, 'installationDate'> {
    installationDate: Dayjs
}
