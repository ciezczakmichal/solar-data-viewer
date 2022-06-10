import { calculateSavings, SavingsCalculationInput } from './savings'

describe('calculateSavings', () => {
    it('test obliczania oszczędności przy kilku zmiennych parametrach z danymi o pełni pasujących datach', () => {
        const baseInput: SavingsCalculationInput = {
            values: [
                {
                    date: '2020-05-17',
                    totalYield: 0,
                    charged: 0,
                    donated: 0,
                    // całkowite zużycie: 0
                },
                {
                    date: '2020-09-30',
                    totalYield: 800,
                    charged: 300,
                    donated: 700,
                    // całkowite zużycie: 800 - 700 + 300 = 400
                    // = tyle zakupu zdołano uniknąć
                    // wartość zaoszczędzona w okresie: 400
                },
                {
                    date: '2020-12-31',
                    totalYield: 1000,
                    charged: 500,
                    donated: 800, // 640 do pobrania; pobrano mniej
                    // całkowite zużycie: 1000 - 800 + 500 = 700
                    // = tyle zakupu zdołano uniknąć
                    // wartość zaoszczędzona w okresie: 700 - 400 = 300
                },
                {
                    date: '2021-03-12', // dowolna data w 2021
                    totalYield: 1250,
                    charged: 800,
                    donated: 900, // 720 do pobrania; pobrano więcej
                    // całkowite zużycie: 1250 - 900 + 800 = 1150
                    // uniknięto zakupu na ilość: 1250 - 900 + (800 - (800 - 720)) = 1070
                    // wartość zaoszczędzona w okresie: 1070 - 700 = 370
                },
            ],
            tariff: [
                {
                    name: 'Parametr #1',
                    values: [
                        {
                            from: '2020-01-01',
                            value: 0.3,
                        },
                        {
                            from: '2021-01-01',
                            value: 0.5,
                        },
                    ],
                },
                {
                    name: 'Parametr #2',
                    values: [
                        {
                            from: '2020-10-01',
                            value: 0.15,
                        },
                    ],
                },
            ],
            vatRate: [
                {
                    from: '2020-01-01',
                    value: 5,
                },
                {
                    from: '2021-01-01',
                    value: 23,
                },
            ],
            plantProperties: {
                installationPower: 1, // bez znaczenia dla testów
                energyInWarehouseFactor: 0.8,
            },
        }

        // test dla 2 pierwszych rekordów
        // oczekiwany wynik: 400 * 0,3 * 1,05 = 126
        let input: SavingsCalculationInput = {
            ...baseInput,
            values: baseInput.values.slice(0, 2),
        }
        let result = calculateSavings(input)
        expect(result.accurate).toEqual(true)
        expect(result.savings.value).toEqual(126)

        // test dla 3 pierwszych rekordów
        // oczekiwany wynik: 126 + (300 * 0,3 + 300 * 0,15) * 1,05 = 267,75
        input = {
            ...baseInput,
            values: baseInput.values.slice(0, 3),
        }
        result = calculateSavings(input)
        expect(result.accurate).toEqual(true)
        expect(result.savings.value).toEqual(267.75)

        // test dla wszystkich rekordów
        // oczekiwany wynik: 267,75 + (370 * (0,5 + 0,15)) * 1,23 = 563,565 -> 563,57
        result = calculateSavings(baseInput)
        expect(result.accurate).toEqual(true)
        expect(result.savings.value).toEqual(563.57)
    })

    // @todo gdy wartości values = 0
    // @todo gdy ilość energii wyprodukowanej nie wystarcza dla potrzeb - ogólnie test nadwyżka / niedobór
    // @todo gdy brakuje parametrów taryfy / stawki vat
    // @todo gdy dane nie są dokładne (accurate)
})
