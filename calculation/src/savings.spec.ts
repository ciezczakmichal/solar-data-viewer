import {
    CompleteValuesRecord,
    MeterRecord,
    TariffItem,
    UnitOfMeasure,
    VatRateItem,
} from 'schema'
import { describe, expect, test } from 'vitest'
import { MetersDataHelper } from './meters-data-helper.js'
import { SavingsCalculationInput, calculateSavings } from './savings.js'
import { Tariff } from './tariff/tariff.js'
import { dayJsDate } from './utils/tests-utils.js'

describe('calculateSavings', () => {
    test('test obliczania oszczędności przy kilku zmiennych parametrach z danymi o pełni pasujących datach', () => {
        const meters: MeterRecord[] = [
            {
                id: 1,
                installationDate: dayJsDate(2020, 5, 17),
                initialValues: {
                    totalYield: 0,
                    charged: 0,
                    donated: 0,
                    // całkowite zużycie: 0
                },
            },
        ]

        const values: CompleteValuesRecord[] = [
            {
                meterId: 1,
                date: dayJsDate(2020, 9, 30),
                totalYield: 800,
                charged: 300,
                donated: 700,
                // całkowite zużycie: 800 - 700 + 300 = 400
                // = tyle zakupu zdołano uniknąć
                // wartość zaoszczędzona w okresie: 400
            },
            {
                meterId: 1,
                date: dayJsDate(2020, 12, 31),
                totalYield: 1000,
                charged: 500,
                donated: 800, // 640 do pobrania; pobrano mniej
                // całkowite zużycie: 1000 - 800 + 500 = 700
                // = tyle zakupu zdołano uniknąć
                // wartość zaoszczędzona w okresie: 700 - 400 = 300
            },
            {
                meterId: 1,
                date: dayJsDate(2021, 3, 12), // dowolna data w 2021
                totalYield: 1250,
                charged: 800,
                donated: 900, // 720 do pobrania; pobrano więcej
                // całkowite zużycie: 1250 - 900 + 800 = 1150
                // uniknięto zakupu na ilość: 1250 - 900 + (800 - (800 - 720)) = 1070
                // wartość zaoszczędzona w okresie: 1070 - 700 = 370
            },
        ]

        const tariffItems: TariffItem[] = [
            {
                name: 'Parametr #1',
                unitOfMeasure: UnitOfMeasure.kWh,
                values: [
                    {
                        from: dayJsDate(2020, 1, 1),
                        value: 0.3,
                    },
                    {
                        from: dayJsDate(2021, 1, 1),
                        value: 0.5,
                    },
                ],
            },
            {
                name: 'Parametr #2',
                unitOfMeasure: UnitOfMeasure.kWh,
                values: [
                    {
                        from: dayJsDate(2020, 10, 1),
                        value: 0.15,
                    },
                ],
            },
        ]

        const vatRates: VatRateItem[] = [
            {
                from: dayJsDate(2020, 1, 1),
                value: 5,
            },
            {
                from: dayJsDate(2021, 1, 1),
                value: 23,
            },
        ]

        const baseInput: SavingsCalculationInput = {
            values,
            plantProperties: {
                installationPower: 1, // bez znaczenia dla testów
                energyInWarehouseFactor: 0.8,
            },
            metersHelper: new MetersDataHelper({ meters, values }),
            tariff: new Tariff(tariffItems, vatRates),
        }

        const prepareInput = (recordCount: number): SavingsCalculationInput => {
            const values = baseInput.values.slice(0, recordCount)

            return {
                ...baseInput,
                values,
                metersHelper: new MetersDataHelper({ meters, values }),
            }
        }

        // test dla pierwszego rekordu
        // oczekiwany wynik: 400 * 0,3 * 1,05 = 126
        let input = prepareInput(1)
        let result = calculateSavings(input)
        expect(result.accurate).toEqual(true)
        expect(result.savings.value).toEqual(126)

        // test dla 2 pierwszych rekordów
        // oczekiwany wynik: 126 + (300 * 0,3 + 300 * 0,15) * 1,05 = 267,75
        input = prepareInput(2)
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
