import {
    BaseValuesRecord,
    CompleteValuesRecord,
    isCompleteRecord,
    MeterRecord,
    SolarDataFormat,
    ValuesRecord,
    ValuesRecordNumberProps,
} from 'schema'
import { CalculationError } from './error'

interface MeterInternalData {
    meterData: MeterRecord
    lastValue: CompleteValuesRecord
    previousMeterId: number | null
}

export type MetersDataHelperInput = Pick<SolarDataFormat, 'meters' | 'values'>

export class MetersDataHelper {
    private data: Map<number, MeterInternalData> = new Map()

    constructor(input: MetersDataHelperInput) {
        const { meters, values } = input
        const valuesReversed = [...values].reverse()
        let previousMeterId = null

        for (const item of meters) {
            const record: MeterInternalData = {
                meterData: item,
                lastValue: this.findLastMeterValue(valuesReversed, item.id),
                previousMeterId,
            }

            this.data.set(item.id, record)
            previousMeterId = item.id
        }
    }

    getFirstMeterId(): number {
        if (this.data.size < 1) {
            throw new CalculationError('Brak danych o licznikach')
        }

        return [...this.data.keys()][0]
    }

    getMeterById(meterId: number): MeterRecord {
        return this.getMeterInternalData(meterId).meterData
    }

    getMeterIdPreviousTo(meterId: number): number | null {
        return this.getMeterInternalData(meterId).previousMeterId
    }

    getMeterInitialValuesAsCompleteRecord(
        meterId: number
    ): CompleteValuesRecord {
        const { installationDate, initialValues } = this.getMeterById(meterId)

        const previousMeterId = this.getMeterIdPreviousTo(meterId)
        let previousMeterLastValue: CompleteValuesRecord | null = null

        if (previousMeterId !== null) {
            previousMeterLastValue = this.getLastMeterValue(previousMeterId)
        }

        const getValue = (field: ValuesRecordNumberProps): number =>
            field in initialValues
                ? (initialValues as any)[field]
                : previousMeterLastValue
                ? previousMeterLastValue[field]
                : 0

        return {
            meterId,
            date: installationDate,
            totalYield: getValue('totalYield'),
            charged: getValue('charged'),
            donated: getValue('donated'),
        }
    }

    getLastMeterValue(meterId: number): CompleteValuesRecord {
        return this.getMeterInternalData(meterId).lastValue
    }

    getMetersIdForPeriod(
        from: BaseValuesRecord,
        to: BaseValuesRecord
    ): number[] {
        if (from.meterId === to.meterId) {
            return [from.meterId]
        }

        const result: number[] = [to.meterId]
        let previous: number | null = to.meterId

        do {
            previous = this.getMeterIdPreviousTo(previous)

            if (previous === null) {
                break
            }

            result.push(previous)
        } while (previous !== from.meterId)

        return result.reverse()
    }

    private getMeterInternalData(meterId: number): MeterInternalData {
        const result = this.data.get(meterId)

        if (!result) {
            throw new CalculationError(
                `Brak danych dla licznika o ID ${meterId}`
            )
        }

        return result
    }

    private findLastMeterValue(
        valuesReversed: ValuesRecord[],
        meterId: number
    ): CompleteValuesRecord {
        const found = valuesReversed.find(item => item.meterId === meterId)

        if (!found) {
            throw new CalculationError(
                `Nie odnaleziono żadnych wartości dla licznika o ID ${meterId}`
            )
        }

        if (!isCompleteRecord(found)) {
            throw new CalculationError(
                `Rekord zawierający ostatnie dane licznika o ID ${meterId} nie zawiera pełnych danych`
            )
        }

        return found
    }
}
