import { BaseValuesRecord } from './values-record'

export interface MeterRecord {
    id: number
    installationDate: string
    initialValues: BaseValuesRecord
    comment?: string
}
