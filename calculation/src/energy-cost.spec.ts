import { UnitOfMeasure } from 'schema'
import { calculateEnergyCost, EnergyCostCalculationInput } from './energy-cost'
import { CalculationError } from './error'
import { TimeVaryingValuesHelper } from './time-varying-values-helper'

describe('calculateEnergyCost', () => {
    describe('testy na minimalnej liczbie danych', () => {
        let input: EnergyCostCalculationInput

        beforeEach(() => {
            input = {
                timeVaryingHelper: new TimeVaryingValuesHelper({
                    tariff: [
                        {
                            name: 'Pozycja #1',
                            unitOfMeasure: UnitOfMeasure.kWh,
                            values: [
                                {
                                    from: '2020-01-01',
                                    value: 0.5,
                                },
                            ], // netto 50
                        },
                    ],
                    vatRate: [
                        {
                            from: '2020-01-01',
                            value: 25,
                        },
                    ],
                }),
                from: '2020-02-01',
                to: '2020-02-01',
                energy: 100,
            }
        })

        it('test obliczania dla jednej pozycji oraz jednej stawce VAT', () => {
            const cost = calculateEnergyCost(input)
            expect(cost.value).toEqual(62.5)
        })

        it('funkcja ignoruje pozycje, które posiadają jednostkę inną niż kWh', () => {
            input.timeVaryingHelper.setTariff([
                ...input.timeVaryingHelper.tariff(),
                {
                    name: 'Pozycja miesięczna',
                    unitOfMeasure: UnitOfMeasure.zlMies,
                    values: [
                        {
                            from: '2020-01-01',
                            value: 0.99,
                        },
                    ],
                },
            ])

            const cost = calculateEnergyCost(input)
            expect(cost.value).toEqual(62.5)
        })
    })

    it('test obliczania dla pierwszych dni z nowymi wartościami', () => {
        const baseInput: EnergyCostCalculationInput = {
            timeVaryingHelper: new TimeVaryingValuesHelper({
                tariff: [
                    {
                        name: 'Pozycja #1',
                        unitOfMeasure: UnitOfMeasure.kWh,
                        values: [
                            {
                                from: '2020-01-01',
                                value: 0.3,
                            }, // netto 30
                            {
                                from: '2020-05-01',
                                value: 0.6,
                            }, // netto 60
                        ],
                    },
                ],
                vatRate: [
                    {
                        from: '2020-01-01',
                        value: 25,
                    },
                    {
                        from: '2020-05-01',
                        value: 50,
                    },
                ],
            }),
            from: 'X',
            to: 'X',
            energy: 100,
        }

        const input1: EnergyCostCalculationInput = {
            ...baseInput,
            from: '2020-01-01',
            to: '2020-01-01',
        }

        const cost1 = calculateEnergyCost(input1)
        expect(cost1.value).toEqual(37.5)

        const input2: EnergyCostCalculationInput = {
            ...baseInput,
            from: '2020-05-01',
            to: '2020-05-01',
        }

        const cost2 = calculateEnergyCost(input2)
        expect(cost2.value).toEqual(90)
    })

    it('test obliczania na podstawie faktury P/22215359/0004/21', () => {
        // daty "from" i "to" nie mają znaczenia, byle były później niż wartości współczynników
        const input: EnergyCostCalculationInput = {
            timeVaryingHelper: new TimeVaryingValuesHelper({
                tariff: [
                    {
                        name: 'Energia czynna',
                        unitOfMeasure: UnitOfMeasure.kWh,
                        values: [
                            {
                                from: '2020-01-01',
                                value: 0.3015, // inna niż w bazie
                            },
                        ], // netto 87,44
                    },
                    {
                        name: 'Opłata jakościowa',
                        unitOfMeasure: UnitOfMeasure.kWh,
                        values: [
                            {
                                from: '2020-01-01',
                                value: 0.0102,
                            },
                        ], // netto 2,96
                    },
                    {
                        name: 'Opłata zmienna sieciowa',
                        unitOfMeasure: UnitOfMeasure.kWh,
                        values: [
                            {
                                from: '2020-01-01',
                                value: 0.1648,
                            },
                        ], // netto 47,79
                    },
                    {
                        name: 'Opłata OZE',
                        unitOfMeasure: UnitOfMeasure.kWh,
                        values: [
                            {
                                from: '2020-01-01',
                                value: 0.0022,
                            },
                        ], // netto 0,64
                    },
                    {
                        name: 'Opłata kogeneracyjna',
                        unitOfMeasure: UnitOfMeasure.kWh,
                        values: [
                            {
                                from: '2020-01-01',
                                value: 0,
                            },
                        ],
                    },
                ],
                vatRate: [
                    {
                        from: '2020-01-01',
                        value: 23,
                    },
                ],
            }),
            from: '2021-03-01',
            to: '2021-03-31',
            energy: 290,
        }

        // netto razem: 138,83

        const cost = calculateEnergyCost(input)
        expect(cost.value).toEqual(170.76)
    })

    describe('test rzucania wyjątku, gdy brakuje pozycji, stawki VAT lub parametrów', () => {
        let input: EnergyCostCalculationInput

        function expectCalculationErrorWithCorrectMessageIsThrown() {
            expect(() => calculateEnergyCost(input)).toThrowError(
                new CalculationError(
                    'Brak parametrów pozycji taryfy dla zadanego zakresu czasowego'
                )
            )
        }

        beforeEach(() => {
            input = {
                timeVaryingHelper: new TimeVaryingValuesHelper({
                    tariff: [
                        {
                            name: 'Pozycja #1',
                            unitOfMeasure: UnitOfMeasure.kWh,
                            values: [
                                {
                                    from: '2020-01-01',
                                    value: 0.5,
                                },
                            ],
                        },
                    ],
                    vatRate: [
                        {
                            from: '2020-01-01',
                            value: 25,
                        },
                    ],
                }),
                from: '2020-02-01',
                to: '2020-02-01',
                energy: 100,
            }
        })

        it('gdy brak pozycji taryfy oraz stawki VAT', () => {
            input.timeVaryingHelper.setTariff([])
            input.timeVaryingHelper.setVatRates([])
            expectCalculationErrorWithCorrectMessageIsThrown()
        })

        it('gdy brak pozycji taryfy', () => {
            input.timeVaryingHelper.setTariff([])
            expectCalculationErrorWithCorrectMessageIsThrown()
        })

        it('gdy brak pozycji taryfy, które posiadają jednostkę kWh', () => {
            input.timeVaryingHelper.setTariff([
                {
                    name: 'Pozycja miesięczna',
                    unitOfMeasure: UnitOfMeasure.zlMies,
                    values: [
                        {
                            from: '2020-01-01',
                            value: 0.99,
                        },
                    ],
                },
            ])

            expectCalculationErrorWithCorrectMessageIsThrown()
        })

        it('gdy brak wartości stawki VAT', () => {
            input.timeVaryingHelper.setVatRates([])

            expect(() => calculateEnergyCost(input)).toThrowError(
                new CalculationError(
                    'Brak stawki VAT dla zadanego zakresu czasowego'
                )
            )
        })

        it('gdy są pozycje, ale zakres dat obejmuje dni bez dostępnych parametrów', () => {
            const input: EnergyCostCalculationInput = {
                timeVaryingHelper: new TimeVaryingValuesHelper({
                    tariff: [
                        {
                            name: 'Pozycja #1',
                            unitOfMeasure: UnitOfMeasure.kWh,
                            values: [
                                {
                                    from: '2020-01-01',
                                    value: 0.5,
                                },
                            ],
                        },
                    ],
                    vatRate: [
                        {
                            from: '2020-01-01',
                            value: 25,
                        },
                    ],
                }),
                from: '2019-12-31',
                to: '2020-01-01',
                energy: 100,
            }

            expect(() => calculateEnergyCost(input)).toThrowError(
                new CalculationError(
                    'Zakres czasowy obejmuje okres, w którym brak wartości pozycji "Pozycja #1"'
                )
            )
        })
    })
})
