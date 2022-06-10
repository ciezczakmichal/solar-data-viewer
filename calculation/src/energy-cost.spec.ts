import { calculateEnergyCost, EnergyCostCalculationInput } from './energy-cost'
import { CalculationError } from './error'

// @todo test gdy daty "od" i "do" są na odwrót

describe('calculateEnergyCost', () => {
    it('test obliczania dla jednego parametru w każdej z grup', () => {
        const input: EnergyCostCalculationInput = {
            tariff: [
                {
                    name: 'Parametr #1',
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
            from: '2020-02-01',
            to: '2020-02-01',
            energy: 100,
        }

        const cost = calculateEnergyCost(input)
        expect(cost.value).toEqual(62.5)
    })

    it('test obliczania dla pierwszych dni z nowymi wartościami', () => {
        const baseInput: EnergyCostCalculationInput = {
            tariff: [
                {
                    name: 'Parametr #1',
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

    it('funkcja nie rzuca wyjątku, gdy taryfa zawiera element bez danych dla zadanego okresu czasowego', () => {
        const input: EnergyCostCalculationInput = {
            tariff: [
                {
                    name: 'Parametr #1',
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
                    name: 'Parametr z danymi dla innego roku',
                    values: [
                        {
                            from: '2022-01-01',
                            value: 0.1234,
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
            from: '2020-02-03',
            to: '2020-03-04',
            energy: 100,
        }

        expect(() => calculateEnergyCost(input)).not.toThrowError()
    })

    it('test obliczania na podstawie faktury P/22215359/0004/21', () => {
        // daty "from" i "to" nie mają znaczenia, byle były później niż wartości współczynników
        const input: EnergyCostCalculationInput = {
            tariff: [
                {
                    name: 'Energia czynna',
                    values: [
                        {
                            from: '2020-01-01',
                            value: 0.3015, // inna niż w bazie
                        },
                    ], // netto 87,44
                },
                {
                    name: 'Opłata jakościowa',
                    values: [
                        {
                            from: '2020-01-01',
                            value: 0.0102,
                        },
                    ], // netto 2,96
                },
                {
                    name: 'Opłata zmienna sieciowa',
                    values: [
                        {
                            from: '2020-01-01',
                            value: 0.1648,
                        },
                    ], // netto 47,79
                },
                {
                    name: 'Opłata OZE',
                    values: [
                        {
                            from: '2020-01-01',
                            value: 0.0022,
                        },
                    ], // netto 0,64
                },
                {
                    name: 'Opłata kogeneracyjna',
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
            from: '2021-03-01',
            to: '2021-03-31',
            energy: 290,
        }

        // netto razem: 138,83

        const cost = calculateEnergyCost(input)
        expect(cost.value).toEqual(170.76)
    })

    describe('test rzucania wyjątku, gdy brakuje parametrów', () => {
        it('gdy nie ma żadnych parametrów', () => {
            const input: EnergyCostCalculationInput = {
                tariff: [],
                vatRate: [],
                from: '2020-02-01',
                to: '2020-02-01',
                energy: 100,
            }

            expect(() => calculateEnergyCost(input)).toThrowError(
                new CalculationError('Brak elementów taryfy')
            )
        })

        it('gdy nie ma parametru taryfy', () => {
            const input: EnergyCostCalculationInput = {
                tariff: [],
                vatRate: [
                    {
                        from: '2020-01-01',
                        value: 25,
                    },
                ],
                from: '2020-02-01',
                to: '2020-02-01',
                energy: 100,
            }

            expect(() => calculateEnergyCost(input)).toThrowError(
                new CalculationError('Brak elementów taryfy')
            )
        })

        it('gdy nie ma parametru ze stawką VAT', () => {
            const input: EnergyCostCalculationInput = {
                tariff: [
                    {
                        name: 'Parametr #1',
                        values: [
                            {
                                from: '2020-01-01',
                                value: 0.5,
                            },
                        ],
                    },
                ],
                vatRate: [],
                from: '2020-02-01',
                to: '2020-02-01',
                energy: 100,
            }

            expect(() => calculateEnergyCost(input)).toThrowError(
                new CalculationError('Brak elementów taryfy')
            )
        })

        it('gdy są parametry, ale zakres dat obejmuje dni bez dostępnych parametrów', () => {
            const input: EnergyCostCalculationInput = {
                tariff: [
                    {
                        name: 'Parametr #1',
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
                from: '2019-12-31',
                to: '2020-01-01',
                energy: 100,
            }

            expect(() => calculateEnergyCost(input)).toThrowError(
                new CalculationError(
                    'Zakres czasowy obejmuje okres, w którym brak wartości parametru "Parametr #1"'
                )
            )
        })
    })

    describe('test rzucania wyjątku, gdy zakres czasowy obejmuje zmiany', () => {
        describe('gdy zmieniono istniejący parametr', () => {
            const input: EnergyCostCalculationInput = {
                tariff: [
                    {
                        name: 'Parametr #1',
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
                vatRate: [
                    {
                        from: '2020-01-01',
                        value: 25,
                    },
                ],
                from: 'X',
                to: 'X',
                energy: 100,
            }

            it('dla zakresu kończącego się w dniu zmiany', () => {
                const localInput: EnergyCostCalculationInput = {
                    ...input,
                    from: '2020-03-01',
                    to: '2020-04-12',
                }

                expect(() => calculateEnergyCost(localInput)).toThrowError(
                    new CalculationError(
                        'Zakres czasowy obejmuje dzień zmiany wartości parametru "Parametr #1"'
                    )
                )
            })

            it('dla zakresu obejmującego dzień zmiany', () => {
                const localInput: EnergyCostCalculationInput = {
                    ...input,
                    from: '2020-03-01',
                    to: '2020-04-13',
                }

                expect(() => calculateEnergyCost(localInput)).toThrowError(
                    new CalculationError(
                        'Zakres czasowy obejmuje dzień zmiany wartości parametru "Parametr #1"'
                    )
                )
            })
        })

        describe('gdy wprowadzono nowy parametr', () => {
            const input: EnergyCostCalculationInput = {
                tariff: [
                    {
                        name: 'Parametr #1',
                        values: [
                            {
                                from: '2020-01-01',
                                value: 0.5,
                            },
                        ],
                    },
                    {
                        name: 'Nowy parametr',
                        values: [
                            {
                                from: '2020-06-01',
                                value: 0.01,
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
                from: 'X',
                to: 'X',
                energy: 100,
            }

            it('dla zakresu kończącego się w dniu zmiany', () => {
                const localInput: EnergyCostCalculationInput = {
                    ...input,
                    from: '2020-05-31',
                    to: '2020-06-01',
                }

                expect(() => calculateEnergyCost(localInput)).toThrowError(
                    new CalculationError(
                        'Zakres czasowy obejmuje okres, w którym brak wartości parametru "Nowy parametr"'
                    )
                )
            })

            it('dla zakresu obejmującego dzień zmiany', () => {
                const localInput: EnergyCostCalculationInput = {
                    ...input,
                    from: '2020-05-31',
                    to: '2020-06-02',
                }

                expect(() => calculateEnergyCost(localInput)).toThrowError(
                    new CalculationError(
                        'Zakres czasowy obejmuje okres, w którym brak wartości parametru "Nowy parametr"'
                    )
                )
            })
        })
    })
})
