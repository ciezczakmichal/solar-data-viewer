import { Dayjs } from 'dayjs'
import { VatRateItem } from 'schema'
import { parseDate } from '../utils/date'
import { VariableValueHolder } from './variable-value-holder'

// @todo: zbędne, od razu typy z Dayjs
type InternalVatRateItem = Omit<VatRateItem, 'from'> & { from: Dayjs }

export class VatRatesHolder extends VariableValueHolder<InternalVatRateItem> {
    constructor(vatRates: VatRateItem[]) {
        super(vatRates.map(item => ({ ...item, from: parseDate(item.from) })))
    }
}
