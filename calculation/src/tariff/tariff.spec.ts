import { TariffItem, UnitOfMeasure, VatRateItem } from 'schema'
import { CalculationError } from '../error'
import {
    dayJsInstance,
    dayJsInstanceWithExtraProperty,
} from '../utils/tests-utils'
import { Tariff } from './tariff'

describe('Tariff', () => {
    describe('getVatTaxRate', () => {
        it('funkcja rzuca wyjątek, jeśli dla wskazanego dnia nie ma dostępnej stawki VAT', () => {
            const vatRates: VatRateItem[] = [
                {
                    from: dayJsInstance(2020, 1, 1),
                    value: 23,
                },
            ]

            const instance = new Tariff([], vatRates)
            const error = new CalculationError(
                'Brak stawki VAT dla zadanego zakresu czasowego',
            )

            expect(() =>
                instance.getVatTaxRate(dayJsInstance(2010, 5, 13)),
            ).toThrow(error)

            expect(() =>
                instance.getVatTaxRate(dayJsInstance(2019, 12, 31)),
            ).toThrow(error)
        })
    })

    describe('getValueChangeDatesForEnergyCost', () => {
        it('zwraca wszystkie dni parametrów kWh', () => {
            const tariffItems: TariffItem[] = [
                {
                    name: 'Pozycja #1',
                    unitOfMeasure: UnitOfMeasure.kWh,
                    values: [
                        {
                            from: dayJsInstance(2020, 1, 1),
                            value: 0.7,
                        },
                    ],
                },
                {
                    name: 'Pozycja z danymi dla innego roku',
                    unitOfMeasure: UnitOfMeasure.kWh,
                    values: [
                        {
                            from: dayJsInstance(2020, 5, 1),
                            value: 0.2,
                        },
                        {
                            from: dayJsInstance(2022, 1, 1),
                            value: 0.005,
                        },
                    ],
                },
                {
                    name: 'Pozycja #3',
                    unitOfMeasure: UnitOfMeasure.kWh,
                    values: [
                        {
                            from: dayJsInstance(2023, 7, 12),
                            value: 0.12,
                        },
                    ],
                },
            ]

            const instance = new Tariff(tariffItems)

            expect(instance.getValueChangeDatesForEnergyCost()).toEqual([
                dayJsInstanceWithExtraProperty(2020, 1, 1),
                dayJsInstanceWithExtraProperty(2020, 5, 1),
                dayJsInstanceWithExtraProperty(2022, 1, 1),
                dayJsInstanceWithExtraProperty(2023, 7, 12),
            ])
        })

        it('uwzględnia dni zmiany stawki VAT', () => {
            const tariffItems: TariffItem[] = [
                {
                    name: 'Pozycja #1',
                    unitOfMeasure: UnitOfMeasure.kWh,
                    values: [
                        {
                            from: dayJsInstance(2020, 1, 1),
                            value: 0.7,
                        },
                    ],
                },
            ]

            const vatRates: VatRateItem[] = [
                {
                    from: dayJsInstance(2019, 1, 23),
                    value: 23,
                },
                {
                    from: dayJsInstance(2021, 1, 5),
                    value: 5,
                },
            ]

            const instance = new Tariff(tariffItems, vatRates)

            expect(instance.getValueChangeDatesForEnergyCost()).toEqual([
                dayJsInstanceWithExtraProperty(2019, 1, 23),
                dayJsInstanceWithExtraProperty(2020, 1, 1),
                dayJsInstanceWithExtraProperty(2021, 1, 5),
            ])
        })

        it('uwzględnia wyłącznie pozycje o jednostce kWh', () => {
            const tariffItems: TariffItem[] = [
                {
                    name: 'Pozycja #1',
                    unitOfMeasure: UnitOfMeasure.kWh,
                    values: [
                        {
                            from: dayJsInstance(2020, 1, 1),
                            value: 0.7,
                        },
                        {
                            from: dayJsInstance(2022, 1, 5),
                            value: 0.005,
                        },
                    ],
                },
                {
                    name: 'Pozycja miesięczna',
                    unitOfMeasure: UnitOfMeasure.zlMies,
                    values: [
                        {
                            from: dayJsInstance(2021, 1, 1),
                            value: 0.13,
                        },
                        {
                            from: dayJsInstance(2021, 6, 13),
                            value: 0.55,
                        },
                    ],
                },
            ]

            const instance = new Tariff(tariffItems)

            expect(instance.getValueChangeDatesForEnergyCost()).toEqual([
                dayJsInstanceWithExtraProperty(2020, 1, 1),
                dayJsInstanceWithExtraProperty(2022, 1, 5),
            ])
        })

        it('nie zwraca duplikatów dat', () => {
            const tariffItems: TariffItem[] = [
                {
                    name: 'Pozycja #1',
                    unitOfMeasure: UnitOfMeasure.kWh,
                    values: [
                        {
                            from: dayJsInstance(2020, 1, 1),
                            value: 0.7,
                        },
                        {
                            from: dayJsInstance(2022, 1, 1),
                            value: 0.005,
                        },
                    ],
                },
                {
                    name: 'Pozycja #2',
                    unitOfMeasure: UnitOfMeasure.kWh,
                    values: [
                        {
                            from: dayJsInstance(2021, 1, 1),
                            value: 0.13,
                        },
                        {
                            from: dayJsInstance(2022, 1, 1),
                            value: 0.55,
                        },
                    ],
                },
            ]

            const vatRates: VatRateItem[] = [
                {
                    from: dayJsInstance(2020, 1, 1),
                    value: 23,
                },
                {
                    from: dayJsInstance(2021, 1, 1),
                    value: 5,
                },
            ]

            const instance = new Tariff(tariffItems, vatRates)

            expect(instance.getValueChangeDatesForEnergyCost()).toEqual([
                dayJsInstanceWithExtraProperty(2020, 1, 1),
                dayJsInstanceWithExtraProperty(2021, 1, 1),
                dayJsInstanceWithExtraProperty(2022, 1, 1),
            ])
        })

        it('sortuje daty rosnąco', () => {
            const tariffItems: TariffItem[] = [
                {
                    name: 'Pozycja #1',
                    unitOfMeasure: UnitOfMeasure.kWh,
                    // dane są posortowane niezgodnie z oczekiwaniami, co ma udowadniać zastosowanie sortowania
                    values: [
                        {
                            from: dayJsInstance(2022, 7, 21),
                            value: 22,
                        },
                        {
                            from: dayJsInstance(2019, 5, 9),
                            value: 19,
                        },
                        {
                            from: dayJsInstance(2035, 2, 25),
                            value: 35,
                        },
                        {
                            from: dayJsInstance(2010, 8, 13),
                            value: 10,
                        },
                    ],
                },
            ]

            const instance = new Tariff(tariffItems)

            expect(instance.getValueChangeDatesForEnergyCost()).toEqual([
                dayJsInstanceWithExtraProperty(2010, 8, 13),
                dayJsInstanceWithExtraProperty(2019, 5, 9),
                dayJsInstanceWithExtraProperty(2022, 7, 21),
                dayJsInstanceWithExtraProperty(2035, 2, 25),
            ])
        })
    })
})
