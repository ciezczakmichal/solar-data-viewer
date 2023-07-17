import { Dayjs } from 'dayjs'
import {
    SolarData,
    TariffItem,
    TariffItemValue,
    UnitOfMeasure,
    VatRateItem,
} from 'schema'
import { CalculationError } from './error'
import { parseDate } from './utils/date'
import { Month } from './utils/month'

export type TimeVaryingValuesHelperInput = Pick<
    SolarData,
    'tariff' | 'vatRates'
>

interface BasicDateItem {
    from: string
}

export class TimeVaryingValuesHelper {
    private _tariff!: TariffItem[]
    private _tariffKwh!: TariffItem[]
    private _tariffFixed!: TariffItem[]
    private _vatRates!: VatRateItem[]

    constructor(input: TimeVaryingValuesHelperInput) {
        this.setTariff(input.tariff)
        this.setVatRates(input.vatRates)
    }

    tariff(): TariffItem[] {
        return this._tariff
    }

    setTariff(items: TariffItem[]) {
        this._tariff = items
        this._tariffKwh = items.filter(
            item => item.unitOfMeasure === UnitOfMeasure.kWh
        )
        this._tariffFixed = items.filter(
            item => item.unitOfMeasure === UnitOfMeasure.zlMies
        )
    }

    vatRates(): VatRateItem[] {
        return this._vatRates
    }

    setVatRates(items: VatRateItem[]) {
        this._vatRates = items
    }

    /**
     * Zwraca wartości pozycji z taryfy, które dotyczą opłat za energię (koszty zmienne) i odnoszą się do zdefiniowanego zakresu czasowego.
     * Zakres czasowy nie może obejmować dnia zmiany lub wprowadzenia wartości taryfy (w takiej sytuacji jest rzucany wyjątek).
     * @param from Pierwszy dzień zakresu czasowego (włącznie)
     * @param to Ostatni dzień zakresu czasowego (włącznie)
     * @returns Tablica wartości pozycji
     */
    getTariffValuesForEnergyCost(
        from: string | Dayjs,
        to: string | Dayjs
    ): TariffItemValue[] {
        const result: TariffItemValue[] = []

        from = parseDate(from)
        to = parseDate(to)

        for (const item of this._tariffKwh) {
            const itemValue = this.findAppropriateItemForRange(
                item.name,
                item.values,
                from,
                to
            )

            if (itemValue) {
                result.push(itemValue)
            }
        }

        return result
    }

    /**
     * Zwraca wartości pozycji z taryfy, które dotyczą opłat stałych i odnoszą się do zdefiniowanego miesiąca.
     * Jeśli we wskazanym miesiącu doszło do zmian w elementach taryfy, rzucany jest wyjątek.
     * @param month Miesiąc, dla którego pobrać dane
     * @returns Tablica wartości pozycji
     * @todo po zmianie definicji opłat stałych - sprawdzić, czy można scalić z getTariffValuesForEnergyCost()
     * @todo testy jednostkowe
     */
    getTariffValuesForFixedCost(month: Month): TariffItemValue[] {
        const result: TariffItemValue[] = []
        const { from, to } = month.dateRange()

        for (const item of this._tariffFixed) {
            const itemValue = this.findAppropriateItemForRange(
                item.name,
                item.values,
                from,
                to
            )

            if (itemValue) {
                result.push(itemValue)
            }
        }

        return result
    }

    /**
     * Zwraca stawkę podatku VAT, który obowiązuje w zdefiniowanym zakresie czasowym.
     * Zakres czasowy nie może obejmować dnia zmiany lub wprowadzenia nowej wartości (w takiej sytuacji jest rzucany wyjątek).
     * Zwracana wartość pochodzi bezpośrednio z danych źródłowych, zatem jest to wartość wyrażona w procentach, np. 23.
     * Rzuca wyjątek, jeśli dla zakresu czasowego nie zdefiniowano wartości.
     * @param from Pierwszy dzień zakresu czasowego (włącznie)
     * @param to Ostatni dzień zakresu czasowego (włącznie)
     * @returns Stawka podatku VAT
     */
    getVatTaxRate(from: string | Dayjs, to: string | Dayjs): number

    /**
     * Zwraca stawkę podatku VAT, który obowiązuje we wskazanym dniu.
     * Zwracana wartość pochodzi bezpośrednio z danych źródłowych, zatem jest to wartość wyrażona w procentach, np. 23.
     * Rzuca wyjątek, jeśli dla podanej daty nie zdefiniowano wartości.
     * @param date Dzień, dla którego pobrać stawkę
     * @returns Stawka podatku VAT
     */
    getVatTaxRate(date: string | Dayjs): number

    getVatTaxRate(fromOrDate: string | Dayjs, to?: string | Dayjs): number {
        const from = parseDate(fromOrDate)

        if (to === undefined) {
            to = from
        } else {
            to = parseDate(to)
        }

        const vatRateItem = this.findAppropriateItemForRange(
            'stawka VAT',
            this._vatRates,
            from,
            to
        )

        if (!vatRateItem) {
            throw new CalculationError(
                'Brak stawki VAT dla zadanego zakresu czasowego'
            )
        }

        return vatRateItem.value
    }

    /**
     * Zwraca wszystkie daty, w których następuje zmiana wartości pozycji taryfy dotyczącej kosztów zmiennych (o jednostce kWh)
     * lub stawki VAT. Daty są posortowane rosnąco.
     * @returns Tablica dat
     */
    getDaysOfChangeForEnergyCost(): Dayjs[] {
        const daysOfChangeSet = new Set<string>()

        for (const item of this._tariffKwh) {
            for (const value of item.values) {
                daysOfChangeSet.add(value.from)
            }
        }

        for (const item of this._vatRates) {
            daysOfChangeSet.add(item.from)
        }

        return [...daysOfChangeSet.values()]
            .map(parseDate)
            .sort((a, b) => (a.isBefore(b) ? -1 : 1))
    }

    private findAppropriateItemForRange<T extends BasicDateItem>(
        name: string,
        items: T[],
        from: Dayjs,
        to: Dayjs
    ): T | null {
        if (items.length === 0) {
            return null
        }

        const nextIndex = items.findIndex(item =>
            parseDate(item.from).isAfter(from)
        )

        if (nextIndex === -1) {
            // wszystkie parametry są młodsze niż data początku, weź ostatni
            return items[items.length - 1]
        }

        const nextItem = items[nextIndex]

        if (!to.isBefore(parseDate(nextItem.from))) {
            if (nextIndex === 0) {
                throw new CalculationError(
                    `Zakres czasowy obejmuje okres, w którym brak wartości pozycji "${name}"`
                )
            }

            throw new CalculationError(
                `Zakres czasowy obejmuje dzień zmiany wartości pozycji "${name}"`
            )
        }

        if (nextIndex === 0) {
            return null
        }

        return items[nextIndex - 1]
    }
}
