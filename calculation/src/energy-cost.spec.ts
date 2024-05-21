import { UnitOfMeasure, type TariffItem, type VatRateItem } from 'schema'
import { beforeEach, describe, expect, test } from 'vitest'
import {
    calculateEnergyCost,
    calculateFixedCost,
    type EnergyCostCalculationInput,
} from './energy-cost.js'
import { CalculationError } from './error.js'
import { Tariff } from './tariff/tariff.js'
import { dayJsDate } from './utils/tests-utils.js'

describe('calculateEnergyCost', () => {
    describe('testy na minimalnej liczbie danych', () => {
        let tariffItems: TariffItem[]
        let vatRates: VatRateItem[]

        beforeEach(() => {
            tariffItems = [
                {
                    name: 'Pozycja #1',
                    unitOfMeasure: UnitOfMeasure.kWh,
                    values: [
                        {
                            from: dayJsDate(2020, 1, 1),
                            value: 0.5,
                        },
                    ], // netto 50
                },
            ]

            vatRates = [
                {
                    from: dayJsDate(2020, 1, 1),
                    value: 25,
                },
            ]
        })

        test('test obliczania dla jednej pozycji oraz jednej stawce VAT', () => {
            const input: EnergyCostCalculationInput = {
                tariff: new Tariff(tariffItems, vatRates),
                date: dayJsDate(2020, 2, 1),
                energy: 100,
            }

            const cost = calculateEnergyCost(input)
            expect(cost.value).toEqual(62.5)
        })

        test('funkcja ignoruje pozycje, które posiadają jednostkę inną niż kWh', () => {
            tariffItems.push({
                name: 'Pozycja miesięczna',
                unitOfMeasure: UnitOfMeasure.zlMies,
                values: [
                    {
                        from: dayJsDate(2020, 1, 1),
                        value: 0.99,
                    },
                ],
            })

            const input: EnergyCostCalculationInput = {
                tariff: new Tariff(tariffItems, vatRates),
                date: dayJsDate(2020, 2, 1),
                energy: 100,
            }

            const cost = calculateEnergyCost(input)
            expect(cost.value).toEqual(62.5)
        })
    })

    test('test obliczania dla pierwszych dni z nowymi wartościami', () => {
        const baseInput: EnergyCostCalculationInput = {
            tariff: new Tariff(
                [
                    {
                        name: 'Pozycja #1',
                        unitOfMeasure: UnitOfMeasure.kWh,
                        values: [
                            {
                                from: dayJsDate(2020, 1, 1),
                                value: 0.3,
                            }, // netto 30
                            {
                                from: dayJsDate(2020, 5, 1),
                                value: 0.6,
                            }, // netto 60
                        ],
                    },
                ],
                [
                    {
                        from: dayJsDate(2020, 1, 1),
                        value: 25,
                    },
                    {
                        from: dayJsDate(2020, 5, 1),
                        value: 50,
                    },
                ],
            ),
            date: dayJsDate(2020, 1, 1),
            energy: 100,
        }

        const input1: EnergyCostCalculationInput = {
            ...baseInput,
        }

        const cost1 = calculateEnergyCost(input1)
        expect(cost1.value).toEqual(37.5)

        const input2: EnergyCostCalculationInput = {
            ...baseInput,
            date: dayJsDate(2020, 5, 1),
        }

        const cost2 = calculateEnergyCost(input2)
        expect(cost2.value).toEqual(90)
    })

    describe('test rzucania wyjątku, gdy brakuje pozycji, stawki VAT lub parametrów', () => {
        let input: EnergyCostCalculationInput

        function expectCalculationErrorWithCorrectMessageIsThrown() {
            expect(() => calculateEnergyCost(input)).toThrow(
                new CalculationError(
                    'Brak parametrów pozycji taryfy dla zadanego zakresu czasowego',
                ),
            )
        }

        beforeEach(() => {
            input = {
                tariff: new Tariff(
                    [
                        {
                            name: 'Pozycja #1',
                            unitOfMeasure: UnitOfMeasure.kWh,
                            values: [
                                {
                                    from: dayJsDate(2020, 1, 1),
                                    value: 0.5,
                                },
                            ],
                        },
                    ],
                    [
                        {
                            from: dayJsDate(2020, 1, 1),
                            value: 25,
                        },
                    ],
                ),
                date: dayJsDate(2020, 2, 1),
                energy: 100,
            }
        })

        test('gdy brak pozycji taryfy oraz stawki VAT', () => {
            input.tariff.setTariff([])
            input.tariff.setVatRates([])
            expectCalculationErrorWithCorrectMessageIsThrown()
        })

        test('gdy brak pozycji taryfy', () => {
            input.tariff.setTariff([])
            expectCalculationErrorWithCorrectMessageIsThrown()
        })

        test('gdy brak pozycji taryfy ze względu na użytą datę', () => {
            input.date = dayJsDate(2019, 3, 1)
            expectCalculationErrorWithCorrectMessageIsThrown()
        })

        test('gdy brak pozycji taryfy, które posiadają jednostkę kWh', () => {
            input.tariff.setTariff([
                {
                    name: 'Pozycja miesięczna',
                    unitOfMeasure: UnitOfMeasure.zlMies,
                    values: [
                        {
                            from: dayJsDate(2020, 1, 1),
                            value: 0.99,
                        },
                    ],
                },
            ])

            expectCalculationErrorWithCorrectMessageIsThrown()
        })

        test('gdy brak wartości stawki VAT', () => {
            input.tariff.setVatRates([])

            expect(() => calculateEnergyCost(input)).toThrow(
                new CalculationError(
                    'Brak stawki VAT dla zadanego zakresu czasowego',
                ),
            )
        })
    })
})

test('calculateXXX - test obliczania na podstawie faktury P/22215359/0004/21', () => {
    const input: EnergyCostCalculationInput = {
        tariff: new Tariff(
            [
                {
                    name: 'Energia czynna',
                    unitOfMeasure: UnitOfMeasure.kWh,
                    values: [
                        {
                            from: dayJsDate(2021, 1, 1),
                            value: 0.3015, // inna niż w bazie
                        },
                    ], // netto 87,44
                },
                {
                    name: 'Opłata jakościowa',
                    unitOfMeasure: UnitOfMeasure.kWh,
                    values: [
                        {
                            from: dayJsDate(2021, 1, 1),
                            value: 0.0102,
                        },
                    ], // netto 2,96
                },
                {
                    name: 'Opłata zmienna sieciowa',
                    unitOfMeasure: UnitOfMeasure.kWh,
                    values: [
                        {
                            from: dayJsDate(2021, 1, 1),
                            value: 0.1648,
                        },
                    ], // netto 47,79
                },
                {
                    name: 'Opłata OZE',
                    unitOfMeasure: UnitOfMeasure.kWh,
                    values: [
                        {
                            from: dayJsDate(2021, 1, 1),
                            value: 0.0022,
                        },
                    ], // netto 0,64
                },
                {
                    name: 'Opłata kogeneracyjna',
                    unitOfMeasure: UnitOfMeasure.kWh,
                    values: [
                        {
                            from: dayJsDate(2021, 1, 1),
                            value: 0,
                        },
                    ],
                },

                {
                    name: 'Opłata stała sieciowa - układ 3-fazowy',
                    unitOfMeasure: UnitOfMeasure.zlMies,
                    values: [
                        {
                            from: dayJsDate(2021, 1, 1),
                            value: 6.02,
                        },
                    ],
                },
                {
                    name: 'Opłata przejściowa > 1200 kWh',
                    unitOfMeasure: UnitOfMeasure.zlMies,
                    values: [
                        {
                            from: dayJsDate(2021, 1, 1),
                            value: 0.33,
                        },
                    ],
                },
                {
                    name: 'Opłata mocowa (1200 - 2800 kWh)',
                    unitOfMeasure: UnitOfMeasure.zlMies,
                    values: [
                        {
                            from: dayJsDate(2021, 1, 1),
                            value: 7.47,
                        },
                    ],
                },
                {
                    name: 'Opłata abonamentowa',
                    unitOfMeasure: UnitOfMeasure.zlMies,
                    values: [
                        {
                            from: dayJsDate(2021, 1, 1),
                            value: 1.92,
                        },
                    ],
                },
            ],
            [
                {
                    from: dayJsDate(2021, 1, 1),
                    value: 23,
                },
            ],
        ),
        date: dayJsDate(2021, 3, 31),
        energy: 290,
    }

    // koszt energii - netto razem: 138,83
    let cost = calculateEnergyCost(input)
    expect(cost.value).toEqual(170.76)

    cost = calculateFixedCost(input.tariff, dayJsDate(2021, 2, 1))
    expect(cost.value).toEqual(19.36)
})
