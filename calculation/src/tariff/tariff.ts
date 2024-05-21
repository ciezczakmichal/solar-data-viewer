import type { Dayjs } from 'dayjs'
import { UnitOfMeasure, type TariffItem, type VatRateItem } from 'schema'
import { CalculationError } from '../error.js'
import { TariffRecord } from './tariff-record.js'
import { VatRatesHolder } from './vat-rates-holder.js'

/**
 * Klasa reprezentująca taryfę cen energii.
 * Posiada także wsparcie dla stawki podatku.
 */
export class Tariff {
    private _items!: TariffRecord[]
    private _tariffKwh!: TariffRecord[]
    private _tariffFixed!: TariffRecord[]

    private _vatRates!: VatRatesHolder

    constructor(items: TariffRecord[], vatRates?: VatRateItem[])
    constructor(items: TariffItem[], vatRates?: VatRateItem[])
    constructor(
        items: TariffRecord[] | TariffItem[],
        vatRates?: VatRateItem[],
    ) {
        this.setTariff(items, vatRates)
    }

    setTariff(items: TariffRecord[], vatRates?: VatRateItem[]): void
    setTariff(items: TariffItem[], vatRates?: VatRateItem[]): void
    setTariff(
        items: TariffRecord[] | TariffItem[],
        vatRates?: VatRateItem[],
    ): void
    setTariff(items: TariffRecord[] | TariffItem[], vatRates?: VatRateItem[]) {
        if (items.length > 0 && items[0] instanceof TariffRecord) {
            this._items = items as TariffRecord[]
        } else {
            this._items = (items as TariffItem[]).map(
                item => new TariffRecord(item),
            )
        }

        this._tariffKwh = this._items.filter(
            item => item.unitOfMeasure === UnitOfMeasure.kWh,
        )
        this._tariffFixed = this._items.filter(
            item => item.unitOfMeasure === UnitOfMeasure.zlMies,
        )

        this.setVatRates(vatRates || [])
    }

    setVatRates(vatRates: VatRateItem[]): void {
        this._vatRates = new VatRatesHolder(vatRates)
    }

    /**
     * Zwraca wartości pozycji z taryfy we wskazanym dniu, które dotyczą opłat za energię (koszty zmienne).
     * @param date Dzień, dla którego pobrać dane
     * @returns Tablica wartości pozycji
     */
    getValuesForEnergyCost(date: Dayjs): number[] {
        return this._tariffKwh
            .map(item => item.valueForDate(date))
            .filter((value): value is number => value !== null)
    }

    /**
     * Zwraca wartości pozycji z taryfy we wskazanym dniu, które dotyczą opłat stałych.
     * @param date Dzień, dla którego pobrać dane
     * @returns Tablica wartości pozycji
     * @todo testy jednostkowe
     */
    getValuesForFixedCost(date: Dayjs): number[] {
        return this._tariffFixed
            .map(item => item.valueForDate(date))
            .filter((value): value is number => value !== null)
    }

    /**
     * Zwraca stawkę podatku VAT, który obowiązuje we wskazanym dniu.
     * Zwracana wartość pochodzi bezpośrednio z danych źródłowych, zatem jest to wartość wyrażona w procentach, np. 23.
     * Rzuca wyjątek, jeśli dla podanej daty nie zdefiniowano wartości.
     * @param date Dzień, dla którego pobrać stawkę
     * @returns Stawka podatku VAT
     */
    getVatTaxRate(date: Dayjs): number {
        const value = this._vatRates.valueForDate(date)

        if (value === null) {
            throw new CalculationError(
                'Brak stawki VAT dla zadanego zakresu czasowego',
            )
        }

        return value
    }

    /**
     * Zwraca wszystkie daty, w których następuje zmiana wartości pozycji taryfy dotyczącej kosztów zmiennych
     * (o jednostce kWh) lub stawki VAT. Daty są posortowane rosnąco.
     * @returns Tablica dat
     */
    getValueChangeDatesForEnergyCost(): Dayjs[] {
        const dates: Dayjs[] = []

        for (const item of this._tariffKwh) {
            for (const date of item.valueChangeDates()) {
                dates.push(date)
            }
        }

        for (const date of this._vatRates.valueChangeDates()) {
            dates.push(date)
        }

        return dates
            .filter(
                (value, index) =>
                    dates.findIndex(date => date.isSame(value)) === index,
            )
            .sort((a, b) => (a.isBefore(b) ? -1 : 1))
    }
}
