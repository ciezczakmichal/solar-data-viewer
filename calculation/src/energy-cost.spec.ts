import { TariffItem, UnitOfMeasure, VatRateItem } from 'schema'
import {
    EnergyCostCalculationInput,
    calculateEnergyCost,
    calculateFixedCost,
} from './energy-cost'
import { CalculationError } from './error'
import { Tariff } from './tariff/tariff'
import { dayJsInstance } from './utils/tests-utils'

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
                            from: dayJsInstance(2020, 1, 1),
                            value: 0.5,
                        },
                    ], // netto 50
                },
            ]

            vatRates = [
                {
                    from: dayJsInstance(2020, 1, 1),
                    value: 25,
                },
            ]
        })

        it('test obliczania dla jednej pozycji oraz jednej stawce VAT', () => {
            const input: EnergyCostCalculationInput = {
                tariff: new Tariff(tariffItems, vatRates),
                date: dayJsInstance(2020, 2, 1),
                energy: 100,
            }

            const cost = calculateEnergyCost(input)
            expect(cost.value).toEqual(62.5)
        })

        it('funkcja ignoruje pozycje, które posiadają jednostkę inną niż kWh', () => {
            tariffItems.push({
                name: 'Pozycja miesięczna',
                unitOfMeasure: UnitOfMeasure.zlMies,
                values: [
                    {
                        from: dayJsInstance(2020, 1, 1),
                        value: 0.99,
                    },
                ],
            })

            const input: EnergyCostCalculationInput = {
                tariff: new Tariff(tariffItems, vatRates),
                date: dayJsInstance(2020, 2, 1),
                energy: 100,
            }

            const cost = calculateEnergyCost(input)
            expect(cost.value).toEqual(62.5)
        })
    })

    it('test obliczania dla pierwszych dni z nowymi wartościami', () => {
        const baseInput: EnergyCostCalculationInput = {
            tariff: new Tariff(
                [
                    {
                        name: 'Pozycja #1',
                        unitOfMeasure: UnitOfMeasure.kWh,
                        values: [
                            {
                                from: dayJsInstance(2020, 1, 1),
                                value: 0.3,
                            }, // netto 30
                            {
                                from: dayJsInstance(2020, 5, 1),
                                value: 0.6,
                            }, // netto 60
                        ],
                    },
                ],
                [
                    {
                        from: dayJsInstance(2020, 1, 1),
                        value: 25,
                    },
                    {
                        from: dayJsInstance(2020, 5, 1),
                        value: 50,
                    },
                ],
            ),
            date: dayJsInstance(2020, 1, 1),
            energy: 100,
        }

        const input1: EnergyCostCalculationInput = {
            ...baseInput,
        }

        const cost1 = calculateEnergyCost(input1)
        expect(cost1.value).toEqual(37.5)

        const input2: EnergyCostCalculationInput = {
            ...baseInput,
            date: dayJsInstance(2020, 5, 1),
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
                                    from: dayJsInstance(2020, 1, 1),
                                    value: 0.5,
                                },
                            ],
                        },
                    ],
                    [
                        {
                            from: dayJsInstance(2020, 1, 1),
                            value: 25,
                        },
                    ],
                ),
                date: dayJsInstance(2020, 2, 1),
                energy: 100,
            }
        })

        it('gdy brak pozycji taryfy oraz stawki VAT', () => {
            input.tariff.setTariff([])
            input.tariff.setVatRates([])
            expectCalculationErrorWithCorrectMessageIsThrown()
        })

        it('gdy brak pozycji taryfy', () => {
            input.tariff.setTariff([])
            expectCalculationErrorWithCorrectMessageIsThrown()
        })

        it('gdy brak pozycji taryfy ze względu na użytą datę', () => {
            input.date = dayJsInstance(2019, 3, 1)
            expectCalculationErrorWithCorrectMessageIsThrown()
        })

        it('gdy brak pozycji taryfy, które posiadają jednostkę kWh', () => {
            input.tariff.setTariff([
                {
                    name: 'Pozycja miesięczna',
                    unitOfMeasure: UnitOfMeasure.zlMies,
                    values: [
                        {
                            from: dayJsInstance(2020, 1, 1),
                            value: 0.99,
                        },
                    ],
                },
            ])

            expectCalculationErrorWithCorrectMessageIsThrown()
        })

        it('gdy brak wartości stawki VAT', () => {
            input.tariff.setVatRates([])

            expect(() => calculateEnergyCost(input)).toThrow(
                new CalculationError(
                    'Brak stawki VAT dla zadanego zakresu czasowego',
                ),
            )
        })
    })
})

describe('calculateXXX - test obliczania na podstawie faktury P/22215359/0004/21', () => {
    const input: EnergyCostCalculationInput = {
        tariff: new Tariff(
            [
                {
                    name: 'Energia czynna',
                    unitOfMeasure: UnitOfMeasure.kWh,
                    values: [
                        {
                            from: dayJsInstance(2021, 1, 1),
                            value: 0.3015, // inna niż w bazie
                        },
                    ], // netto 87,44
                },
                {
                    name: 'Opłata jakościowa',
                    unitOfMeasure: UnitOfMeasure.kWh,
                    values: [
                        {
                            from: dayJsInstance(2021, 1, 1),
                            value: 0.0102,
                        },
                    ], // netto 2,96
                },
                {
                    name: 'Opłata zmienna sieciowa',
                    unitOfMeasure: UnitOfMeasure.kWh,
                    values: [
                        {
                            from: dayJsInstance(2021, 1, 1),
                            value: 0.1648,
                        },
                    ], // netto 47,79
                },
                {
                    name: 'Opłata OZE',
                    unitOfMeasure: UnitOfMeasure.kWh,
                    values: [
                        {
                            from: dayJsInstance(2021, 1, 1),
                            value: 0.0022,
                        },
                    ], // netto 0,64
                },
                {
                    name: 'Opłata kogeneracyjna',
                    unitOfMeasure: UnitOfMeasure.kWh,
                    values: [
                        {
                            from: dayJsInstance(2021, 1, 1),
                            value: 0,
                        },
                    ],
                },

                {
                    name: 'Opłata stała sieciowa - układ 3-fazowy',
                    unitOfMeasure: UnitOfMeasure.zlMies,
                    values: [
                        {
                            from: dayJsInstance(2021, 1, 1),
                            value: 6.02,
                        },
                    ],
                },
                {
                    name: 'Opłata przejściowa > 1200 kWh',
                    unitOfMeasure: UnitOfMeasure.zlMies,
                    values: [
                        {
                            from: dayJsInstance(2021, 1, 1),
                            value: 0.33,
                        },
                    ],
                },
                {
                    name: 'Opłata mocowa (1200 - 2800 kWh)',
                    unitOfMeasure: UnitOfMeasure.zlMies,
                    values: [
                        {
                            from: dayJsInstance(2021, 1, 1),
                            value: 7.47,
                        },
                    ],
                },
                {
                    name: 'Opłata abonamentowa',
                    unitOfMeasure: UnitOfMeasure.zlMies,
                    values: [
                        {
                            from: dayJsInstance(2021, 1, 1),
                            value: 1.92,
                        },
                    ],
                },
            ],
            [
                {
                    from: dayJsInstance(2021, 1, 1),
                    value: 23,
                },
            ],
        ),
        date: dayJsInstance(2021, 3, 31),
        energy: 290,
    }

    // koszt energii - netto razem: 138,83
    let cost = calculateEnergyCost(input)
    expect(cost.value).toEqual(170.76)

    cost = calculateFixedCost(input.tariff, dayJsInstance(2021, 2, 1))
    expect(cost.value).toEqual(19.36)
})
