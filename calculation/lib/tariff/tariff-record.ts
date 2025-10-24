import { type TariffItem, type TariffItemValue, UnitOfMeasure } from 'schema'
import { VariableValueHolder } from './variable-value-holder.js'

/**
 * Klasa reprezentująca pozycję w taryfie energii elektrycznej.
 * @todo zmiana nazwy w schema, zmiana na TariffItem
 */
export class TariffRecord extends VariableValueHolder<TariffItemValue> {
    public readonly name: string
    public readonly unitOfMeasure: UnitOfMeasure

    constructor(data: TariffItem) {
        super(data.values)

        this.name = data.name
        this.unitOfMeasure = data.unitOfMeasure
    }
}
