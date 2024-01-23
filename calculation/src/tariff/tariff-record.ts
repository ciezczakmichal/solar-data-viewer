import { Dayjs } from 'dayjs'
import { TariffItem, TariffItemValue, UnitOfMeasure } from 'schema'
import { parseDate } from '../utils/date'
import { VariableValueHolder } from './variable-value-holder'

// @todo: zbędne, od razu typy z Dayjs
type InternalTariffItemValue = Omit<TariffItemValue, 'from'> & { from: Dayjs }

/**
 * Klasa reprezentująca pozycję w taryfie energii elektrycznej.
 * @todo zmiana nazwy w schema, zmiana na TariffItem
 */
export class TariffRecord extends VariableValueHolder<InternalTariffItemValue> {
    public readonly name: string
    public readonly unitOfMeasure: UnitOfMeasure

    constructor(data: TariffItem) {
        super(
            data.values.map(item => ({ ...item, from: parseDate(item.from) })),
        )

        this.name = data.name
        this.unitOfMeasure = data.unitOfMeasure
    }
}
