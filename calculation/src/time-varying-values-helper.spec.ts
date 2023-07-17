import { UnitOfMeasure } from 'schema'
import {
    TimeVaryingValuesHelperInput,
    TimeVaryingValuesHelper,
} from './time-varying-values-helper'
import { CalculationError } from './error'
import { dayJsInstanceWithExtraProperty } from './utils/tests-utils'

// @todo test gdy daty "od" i "do" są na odwrót

describe('TimeVaryingValuesHelper', () => {
    describe('getTariffValuesForEnergyCost', () => {
        it('test poprawności zwracanych wartości w poszczególnych okresach ważności', () => {
            const input: TimeVaryingValuesHelperInput = {
                tariff: [
                    {
                        name: 'Pozycja #1',
                        unitOfMeasure: UnitOfMeasure.kWh,
                        values: [
                            {
                                from: '2020-01-01',
                                value: 0.7,
                            },
                            {
                                from: '2020-05-01',
                                value: 0.2,
                            },
                        ],
                    },
                    {
                        name: 'Pozycja z danymi dla innego roku',
                        unitOfMeasure: UnitOfMeasure.kWh,
                        values: [
                            {
                                from: '2022-01-01',
                                value: 0.1234,
                            },
                        ],
                    },
                ],
                vatRates: [],
            }

            const instance = new TimeVaryingValuesHelper(input)

            expect(
                instance.getTariffValuesForEnergyCost(
                    '2018-01-01',
                    '2019-12-31'
                )
            ).toEqual([])

            expect(
                instance.getTariffValuesForEnergyCost(
                    '2020-01-01',
                    '2020-04-30'
                )
            ).toEqual([
                {
                    from: '2020-01-01',
                    value: 0.7,
                },
            ])

            expect(
                instance.getTariffValuesForEnergyCost(
                    '2020-05-01',
                    '2021-12-31'
                )
            ).toEqual([
                {
                    from: '2020-05-01',
                    value: 0.2,
                },
            ])

            expect(
                instance.getTariffValuesForEnergyCost(
                    '2022-01-01',
                    '2030-05-12' // dowolna późniejsza data
                )
            ).toEqual([
                {
                    from: '2020-05-01',
                    value: 0.2,
                },
                {
                    from: '2022-01-01',
                    value: 0.1234,
                },
            ])
        })

        describe('funkcja rzuca wyjątek, gdy zakres czasowy obejmuje zmiany', () => {
            describe('gdy zmieniono istniejącą pozycję', () => {
                let instance: TimeVaryingValuesHelper

                beforeEach(() => {
                    const input: TimeVaryingValuesHelperInput = {
                        tariff: [
                            {
                                name: 'Pozycja #1',
                                unitOfMeasure: UnitOfMeasure.kWh,
                                values: [
                                    {
                                        from: '2020-01-01',
                                        value: 0.5,
                                    },
                                    {
                                        from: '2020-04-12',
                                        value: 0.75,
                                    },
                                ],
                            },
                        ],
                        vatRates: [],
                    }

                    instance = new TimeVaryingValuesHelper(input)
                })

                it('dla zakresu kończącego się w dniu zmiany', () => {
                    expect(() =>
                        instance.getTariffValuesForEnergyCost(
                            '2020-03-01',
                            '2020-04-12'
                        )
                    ).toThrowError(
                        new CalculationError(
                            'Zakres czasowy obejmuje dzień zmiany wartości pozycji "Pozycja #1"'
                        )
                    )
                })

                it('dla zakresu obejmującego dzień zmiany', () => {
                    expect(() =>
                        instance.getTariffValuesForEnergyCost(
                            '2020-03-01',
                            '2020-04-13'
                        )
                    ).toThrowError(
                        new CalculationError(
                            'Zakres czasowy obejmuje dzień zmiany wartości pozycji "Pozycja #1"'
                        )
                    )
                })
            })

            describe('gdy wprowadzono nową pozycję', () => {
                let instance: TimeVaryingValuesHelper

                beforeEach(() => {
                    const input: TimeVaryingValuesHelperInput = {
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
                            {
                                name: 'Nowa pozycja',
                                unitOfMeasure: UnitOfMeasure.kWh,
                                values: [
                                    {
                                        from: '2020-06-01',
                                        value: 0.01,
                                    },
                                ],
                            },
                        ],
                        vatRates: [],
                    }

                    instance = new TimeVaryingValuesHelper(input)
                })

                it('dla zakresu kończącego się w dniu zmiany', () => {
                    expect(() =>
                        instance.getTariffValuesForEnergyCost(
                            '2020-05-31',
                            '2020-06-01'
                        )
                    ).toThrowError(
                        new CalculationError(
                            'Zakres czasowy obejmuje okres, w którym brak wartości pozycji "Nowa pozycja"'
                        )
                    )
                })

                it('dla zakresu obejmującego dzień zmiany', () => {
                    expect(() =>
                        instance.getTariffValuesForEnergyCost(
                            '2020-05-31',
                            '2020-06-02'
                        )
                    ).toThrowError(
                        new CalculationError(
                            'Zakres czasowy obejmuje okres, w którym brak wartości pozycji "Nowa pozycja"'
                        )
                    )
                })
            })
        })
    })

    describe('getVatTaxRate', () => {
        it('test poprawności zwracanych wartości w poszczególnych okresach ważności', () => {
            const input: TimeVaryingValuesHelperInput = {
                tariff: [],
                vatRates: [
                    {
                        from: '2020-01-01',
                        value: 23,
                    },
                    {
                        from: '2020-06-01',
                        value: 5,
                    },
                    {
                        from: '2022-01-01',
                        value: 50,
                    },
                ],
            }

            const instance = new TimeVaryingValuesHelper(input)
            let result: number

            result = instance.getVatTaxRate('2020-01-01', '2020-05-31')
            expect(result).toEqual(23)

            result = instance.getVatTaxRate('2020-06-01', '2021-12-31')
            expect(result).toEqual(5)

            result = instance.getVatTaxRate('2022-01-01', '2035-11-24') // dowolna późniejsza data
            expect(result).toEqual(50)

            // test wersji z jednym argumentem

            result = instance.getVatTaxRate('2020-05-31')
            expect(result).toEqual(23)

            result = instance.getVatTaxRate('2021-12-31')
            expect(result).toEqual(5)

            result = instance.getVatTaxRate('2035-11-24')
            expect(result).toEqual(50)
        })

        it('funkcja rzuca wyjątek, jeśli dla zadanego okresu lub pojedynczych dni nie ma dostępnej stawki VAT', () => {
            const input: TimeVaryingValuesHelperInput = {
                tariff: [],
                vatRates: [
                    {
                        from: '2020-01-01',
                        value: 23,
                    },
                ],
            }

            const instance = new TimeVaryingValuesHelper(input)
            const error = new CalculationError(
                'Brak stawki VAT dla zadanego zakresu czasowego'
            )

            expect(() =>
                instance.getVatTaxRate('2019-05-13', '2019-12-31')
            ).toThrowError(error)

            expect(() => instance.getVatTaxRate('2019-05-13')).toThrowError(
                error
            )
            expect(() => instance.getVatTaxRate('2019-12-31')).toThrowError(
                error
            )
        })

        describe('funkcja rzuca wyjątek, gdy zakres czasowy obejmuje zmiany', () => {
            let instance: TimeVaryingValuesHelper

            beforeEach(() => {
                const input: TimeVaryingValuesHelperInput = {
                    tariff: [],
                    vatRates: [
                        {
                            from: '2020-01-01',
                            value: 5,
                        },
                        {
                            from: '2020-04-12',
                            value: 23,
                        },
                    ],
                }

                instance = new TimeVaryingValuesHelper(input)
            })

            it('dla zakresu kończącego się w dniu zmiany', () => {
                expect(() =>
                    instance.getVatTaxRate('2020-03-01', '2020-04-12')
                ).toThrowError(
                    new CalculationError(
                        'Zakres czasowy obejmuje dzień zmiany wartości pozycji "stawka VAT"'
                    )
                )
            })

            it('dla zakresu obejmującego dzień zmiany', () => {
                expect(() =>
                    instance.getVatTaxRate('2020-03-01', '2020-04-13')
                ).toThrowError(
                    new CalculationError(
                        'Zakres czasowy obejmuje dzień zmiany wartości pozycji "stawka VAT"'
                    )
                )
            })
        })
    })

    describe('getDaysOfChangeForEnergyCost', () => {
        it('zwraca wszystkie dni parametrów kWh', () => {
            const input: TimeVaryingValuesHelperInput = {
                tariff: [
                    {
                        name: 'Pozycja #1',
                        unitOfMeasure: UnitOfMeasure.kWh,
                        values: [
                            {
                                from: '2020-01-01',
                                value: 0.7,
                            },
                        ],
                    },
                    {
                        name: 'Pozycja z danymi dla innego roku',
                        unitOfMeasure: UnitOfMeasure.kWh,
                        values: [
                            {
                                from: '2020-05-01',
                                value: 0.2,
                            },
                            {
                                from: '2022-01-01',
                                value: 0.005,
                            },
                        ],
                    },
                    {
                        name: 'Pozycja #3',
                        unitOfMeasure: UnitOfMeasure.kWh,
                        values: [
                            {
                                from: '2023-07-12',
                                value: 0.12,
                            },
                        ],
                    },
                ],
                vatRates: [],
            }

            const instance = new TimeVaryingValuesHelper(input)

            expect(instance.getDaysOfChangeForEnergyCost()).toEqual([
                dayJsInstanceWithExtraProperty(2020, 1, 1),
                dayJsInstanceWithExtraProperty(2020, 5, 1),
                dayJsInstanceWithExtraProperty(2022, 1, 1),
                dayJsInstanceWithExtraProperty(2023, 7, 12),
            ])
        })

        it('uwzględnia dni zmiany stawki VAT', () => {
            const input: TimeVaryingValuesHelperInput = {
                tariff: [
                    {
                        name: 'Pozycja #1',
                        unitOfMeasure: UnitOfMeasure.kWh,
                        values: [
                            {
                                from: '2020-01-01',
                                value: 0.7,
                            },
                        ],
                    },
                ],
                vatRates: [
                    {
                        from: '2019-01-23',
                        value: 23,
                    },
                    {
                        from: '2021-01-05',
                        value: 5,
                    },
                ],
            }

            const instance = new TimeVaryingValuesHelper(input)

            expect(instance.getDaysOfChangeForEnergyCost()).toEqual([
                dayJsInstanceWithExtraProperty(2019, 1, 23),
                dayJsInstanceWithExtraProperty(2020, 1, 1),
                dayJsInstanceWithExtraProperty(2021, 1, 5),
            ])
        })

        it('uwzględnia wyłącznie pozycje o jednostce kWh', () => {
            const input: TimeVaryingValuesHelperInput = {
                tariff: [
                    {
                        name: 'Pozycja #1',
                        unitOfMeasure: UnitOfMeasure.kWh,
                        values: [
                            {
                                from: '2020-01-01',
                                value: 0.7,
                            },
                            {
                                from: '2022-01-05',
                                value: 0.005,
                            },
                        ],
                    },
                    {
                        name: 'Pozycja miesięczna',
                        unitOfMeasure: UnitOfMeasure.zlMies,
                        values: [
                            {
                                from: '2021-01-01',
                                value: 0.13,
                            },
                            {
                                from: '2021-06-13',
                                value: 0.55,
                            },
                        ],
                    },
                ],
                vatRates: [],
            }

            const instance = new TimeVaryingValuesHelper(input)

            expect(instance.getDaysOfChangeForEnergyCost()).toEqual([
                dayJsInstanceWithExtraProperty(2020, 1, 1),
                dayJsInstanceWithExtraProperty(2022, 1, 5),
            ])
        })

        it('nie zwraca duplikatów dat', () => {
            const input: TimeVaryingValuesHelperInput = {
                tariff: [
                    {
                        name: 'Pozycja #1',
                        unitOfMeasure: UnitOfMeasure.kWh,
                        values: [
                            {
                                from: '2020-01-01',
                                value: 0.7,
                            },
                            {
                                from: '2022-01-01',
                                value: 0.005,
                            },
                        ],
                    },
                    {
                        name: 'Pozycja #2',
                        unitOfMeasure: UnitOfMeasure.kWh,
                        values: [
                            {
                                from: '2021-01-01',
                                value: 0.13,
                            },
                            {
                                from: '2022-01-01',
                                value: 0.55,
                            },
                        ],
                    },
                ],
                vatRates: [
                    {
                        from: '2020-01-01',
                        value: 23,
                    },
                    {
                        from: '2021-01-01',
                        value: 5,
                    },
                ],
            }

            const instance = new TimeVaryingValuesHelper(input)

            expect(instance.getDaysOfChangeForEnergyCost()).toEqual([
                dayJsInstanceWithExtraProperty(2020, 1, 1),
                dayJsInstanceWithExtraProperty(2021, 1, 1),
                dayJsInstanceWithExtraProperty(2022, 1, 1),
            ])
        })

        it('sortuje daty rosnąco', () => {
            const input: TimeVaryingValuesHelperInput = {
                tariff: [
                    {
                        name: 'Pozycja #1',
                        unitOfMeasure: UnitOfMeasure.kWh,
                        // dane są posortowane niezgodnie z oczekiwaniami, co ma udowadniać zastosowanie sortowania
                        values: [
                            {
                                from: '2022-07-21',
                                value: 22,
                            },
                            {
                                from: '2019-05-09',
                                value: 19,
                            },
                            {
                                from: '2035-02-25',
                                value: 35,
                            },
                        ],
                    },
                ],
                vatRates: [],
            }

            const instance = new TimeVaryingValuesHelper(input)

            expect(instance.getDaysOfChangeForEnergyCost()).toEqual([
                dayJsInstanceWithExtraProperty(2019, 5, 9),
                dayJsInstanceWithExtraProperty(2022, 7, 21),
                dayJsInstanceWithExtraProperty(2035, 2, 25),
            ])
        })
    })
})
