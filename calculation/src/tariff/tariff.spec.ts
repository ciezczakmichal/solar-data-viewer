import { UnitOfMeasure, type TariffItem, type VatRateItem } from 'schema'
import { describe, expect, test } from 'vitest'
import { CalculationError } from '../error.js'
import { dayJsDate, dayJsDateWithProperty } from '../utils/tests-utils.js'
import { Tariff } from './tariff.js'

describe('Tariff', () => {
    describe('getVatTaxRate', () => {
        test('funkcja rzuca wyjątek, jeśli dla wskazanego dnia nie ma dostępnej stawki VAT', () => {
            const vatRates: VatRateItem[] = [
                {
                    from: dayJsDate(2020, 1, 1),
                    value: 23,
                },
            ]

            const instance = new Tariff([], vatRates)
            const error = new CalculationError(
                'Brak stawki VAT dla zadanego zakresu czasowego',
            )

            expect(() =>
                instance.getVatTaxRate(dayJsDate(2010, 5, 13)),
            ).toThrow(error)

            expect(() =>
                instance.getVatTaxRate(dayJsDate(2019, 12, 31)),
            ).toThrow(error)
        })
    })

    describe('getValueChangeDatesForEnergyCost', () => {
        test('zwraca wszystkie dni parametrów kWh', () => {
            const tariffItems: TariffItem[] = [
                {
                    name: 'Pozycja #1',
                    unitOfMeasure: UnitOfMeasure.kWh,
                    values: [
                        {
                            from: dayJsDate(2020, 1, 1),
                            value: 0.7,
                        },
                    ],
                },
                {
                    name: 'Pozycja z danymi dla innego roku',
                    unitOfMeasure: UnitOfMeasure.kWh,
                    values: [
                        {
                            from: dayJsDate(2020, 5, 1),
                            value: 0.2,
                        },
                        {
                            from: dayJsDate(2022, 1, 1),
                            value: 0.005,
                        },
                    ],
                },
                {
                    name: 'Pozycja #3',
                    unitOfMeasure: UnitOfMeasure.kWh,
                    values: [
                        {
                            from: dayJsDate(2023, 7, 12),
                            value: 0.12,
                        },
                    ],
                },
            ]

            const instance = new Tariff(tariffItems)

            expect(instance.getValueChangeDatesForEnergyCost()).toEqual([
                dayJsDateWithProperty(2020, 1, 1),
                dayJsDateWithProperty(2020, 5, 1),
                dayJsDateWithProperty(2022, 1, 1),
                dayJsDateWithProperty(2023, 7, 12),
            ])
        })

        test('uwzględnia dni zmiany stawki VAT', () => {
            const tariffItems: TariffItem[] = [
                {
                    name: 'Pozycja #1',
                    unitOfMeasure: UnitOfMeasure.kWh,
                    values: [
                        {
                            from: dayJsDate(2020, 1, 1),
                            value: 0.7,
                        },
                    ],
                },
            ]

            const vatRates: VatRateItem[] = [
                {
                    from: dayJsDate(2019, 1, 23),
                    value: 23,
                },
                {
                    from: dayJsDate(2021, 1, 5),
                    value: 5,
                },
            ]

            const instance = new Tariff(tariffItems, vatRates)

            expect(instance.getValueChangeDatesForEnergyCost()).toEqual([
                dayJsDateWithProperty(2019, 1, 23),
                dayJsDateWithProperty(2020, 1, 1),
                dayJsDateWithProperty(2021, 1, 5),
            ])
        })

        test('uwzględnia wyłącznie pozycje o jednostce kWh', () => {
            const tariffItems: TariffItem[] = [
                {
                    name: 'Pozycja #1',
                    unitOfMeasure: UnitOfMeasure.kWh,
                    values: [
                        {
                            from: dayJsDate(2020, 1, 1),
                            value: 0.7,
                        },
                        {
                            from: dayJsDate(2022, 1, 5),
                            value: 0.005,
                        },
                    ],
                },
                {
                    name: 'Pozycja miesięczna',
                    unitOfMeasure: UnitOfMeasure.zlMies,
                    values: [
                        {
                            from: dayJsDate(2021, 1, 1),
                            value: 0.13,
                        },
                        {
                            from: dayJsDate(2021, 6, 13),
                            value: 0.55,
                        },
                    ],
                },
            ]

            const instance = new Tariff(tariffItems)

            expect(instance.getValueChangeDatesForEnergyCost()).toEqual([
                dayJsDateWithProperty(2020, 1, 1),
                dayJsDateWithProperty(2022, 1, 5),
            ])
        })

        test('nie zwraca duplikatów dat', () => {
            const tariffItems: TariffItem[] = [
                {
                    name: 'Pozycja #1',
                    unitOfMeasure: UnitOfMeasure.kWh,
                    values: [
                        {
                            from: dayJsDate(2020, 1, 1),
                            value: 0.7,
                        },
                        {
                            from: dayJsDate(2022, 1, 1),
                            value: 0.005,
                        },
                    ],
                },
                {
                    name: 'Pozycja #2',
                    unitOfMeasure: UnitOfMeasure.kWh,
                    values: [
                        {
                            from: dayJsDate(2021, 1, 1),
                            value: 0.13,
                        },
                        {
                            from: dayJsDate(2022, 1, 1),
                            value: 0.55,
                        },
                    ],
                },
            ]

            const vatRates: VatRateItem[] = [
                {
                    from: dayJsDate(2020, 1, 1),
                    value: 23,
                },
                {
                    from: dayJsDate(2021, 1, 1),
                    value: 5,
                },
            ]

            const instance = new Tariff(tariffItems, vatRates)

            expect(instance.getValueChangeDatesForEnergyCost()).toEqual([
                dayJsDateWithProperty(2020, 1, 1),
                dayJsDateWithProperty(2021, 1, 1),
                dayJsDateWithProperty(2022, 1, 1),
            ])
        })

        test('sortuje daty rosnąco', () => {
            const tariffItems: TariffItem[] = [
                {
                    name: 'Pozycja #1',
                    unitOfMeasure: UnitOfMeasure.kWh,
                    // dane są posortowane niezgodnie z oczekiwaniami, co ma udowadniać zastosowanie sortowania
                    values: [
                        {
                            from: dayJsDate(2022, 7, 21),
                            value: 22,
                        },
                        {
                            from: dayJsDate(2019, 5, 9),
                            value: 19,
                        },
                        {
                            from: dayJsDate(2035, 2, 25),
                            value: 35,
                        },
                        {
                            from: dayJsDate(2010, 8, 13),
                            value: 10,
                        },
                    ],
                },
            ]

            const instance = new Tariff(tariffItems)

            expect(instance.getValueChangeDatesForEnergyCost()).toEqual([
                dayJsDateWithProperty(2010, 8, 13),
                dayJsDateWithProperty(2019, 5, 9),
                dayJsDateWithProperty(2022, 7, 21),
                dayJsDateWithProperty(2035, 2, 25),
            ])
        })
    })
})
