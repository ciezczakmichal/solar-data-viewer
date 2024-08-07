import type { ValuesRecord } from 'schema'
import { dayJsDate, dayJsDateWithProperty } from 'calculation'
import { describe, expect, test } from 'vitest'
import {
    DataRange,
    getCompleteRecordsForRange,
    getRecordsForRange,
    getYieldRecordsForRange,
} from './records-for-range'

describe('records-for-range', () => {
    describe('getRecordsForRange - podstawowy test zwracania rekordów', () => {
        const values: ValuesRecord[] = [
            {
                meterId: 1,
                date: dayJsDate(2022, 3, 18), // piątek
                totalYield: 100,
            },
            {
                meterId: 1,
                date: dayJsDate(2022, 3, 20), // niedziela
                totalYield: 123,
            },
            {
                meterId: 1,
                date: dayJsDate(2022, 3, 23), // środa
                charged: 1050,
                donated: 12,
            },
            {
                meterId: 1,
                date: dayJsDate(2022, 3, 27), // niedziela
                totalYield: 150,
            },
            {
                meterId: 1,
                date: dayJsDate(2022, 3, 31), // czwartek
                charged: 1123,
                donated: 120,
            },
            {
                meterId: 1,
                date: dayJsDate(2022, 4, 8), // piątek
                totalYield: 170,
            },
            {
                meterId: 1,
                date: dayJsDate(2022, 5, 8), // niedziela
                totalYield: 270,
            },
        ]

        test('tygodniowy zakres danych', () => {
            const actual = getRecordsForRange(values, DataRange.Week)

            expect(actual).toEqual([
                {
                    date: dayJsDateWithProperty(2022, 3, 20),
                    values: {
                        meterId: 1,
                        date: dayJsDate(2022, 3, 20), // niedziela
                        totalYield: 123,
                    },
                },
                {
                    date: dayJsDateWithProperty(2022, 3, 27),
                    values: {
                        meterId: 1,
                        date: dayJsDate(2022, 3, 27), // niedziela
                        totalYield: 150,
                    },
                },
                {
                    date: dayJsDate(2022, 4, 3),
                    values: null,
                },
                {
                    date: dayJsDate(2022, 4, 10),
                    values: null,
                },
                {
                    date: dayJsDate(2022, 4, 17),
                    values: null,
                },
                {
                    date: dayJsDate(2022, 4, 24),
                    values: null,
                },
                {
                    date: dayJsDate(2022, 5, 1),
                    values: null,
                },
                {
                    date: dayJsDateWithProperty(2022, 5, 8),
                    values: {
                        meterId: 1,
                        date: dayJsDate(2022, 5, 8), // niedziela
                        totalYield: 270,
                    },
                },
            ])
        })

        test('miesięczny zakres danych', () => {
            const actual = getRecordsForRange(values, DataRange.Month)
            expect(actual).toEqual([
                {
                    date: dayJsDateWithProperty(2022, 3, 31),
                    values: {
                        meterId: 1,
                        date: dayJsDate(2022, 3, 31), // czwartek
                        charged: 1123,
                        donated: 120,
                    },
                },
                {
                    date: dayJsDate(2022, 4, 30),
                    values: null,
                },
                {
                    date: dayJsDateWithProperty(2022, 5, 8),
                    values: {
                        meterId: 1,
                        date: dayJsDate(2022, 5, 8), // niedziela
                        totalYield: 270,
                    },
                },
            ])
        })
    })

    describe('get[...]RecordsForRange zwracają NULL, gdy dane dnia występują, lecz nie pasują do typu', () => {
        const values: ValuesRecord[] = [
            {
                meterId: 1,
                date: dayJsDate(2022, 1, 30), // niedziela
                totalYield: 50,
                charged: 1000,
                donated: 500,
            },
            {
                meterId: 1,
                date: dayJsDate(2022, 1, 31), // poniedziałek
                totalYield: 60,
            },
            {
                meterId: 1,
                date: dayJsDate(2022, 2, 6), // niedziela
                totalYield: 70,
            },
            {
                meterId: 1,
                date: dayJsDate(2022, 2, 10), // czwartek
                totalYield: 100,
            },
            {
                meterId: 1,
                date: dayJsDate(2022, 2, 13), // niedziela
                charged: 1500,
                donated: 800,
            },
            {
                meterId: 1,
                date: dayJsDate(2022, 2, 20), // niedziela
                totalYield: 200,
                charged: 2000,
                donated: 1000,
            },
        ]

        test('getYieldRecordsForRange - tygodniowy zakres danych', () => {
            const actual = getYieldRecordsForRange(values, DataRange.Week)
            expect(actual).toEqual([
                {
                    date: dayJsDateWithProperty(2022, 1, 30),
                    values: {
                        meterId: 1,
                        date: dayJsDate(2022, 1, 30), // niedziela
                        totalYield: 50,
                        charged: 1000,
                        donated: 500,
                    },
                },
                {
                    date: dayJsDateWithProperty(2022, 2, 6),
                    values: {
                        meterId: 1,
                        date: dayJsDate(2022, 2, 6), // niedziela
                        totalYield: 70,
                    },
                },
                {
                    date: dayJsDate(2022, 2, 13),
                    values: null,
                },
                {
                    date: dayJsDateWithProperty(2022, 2, 20),
                    values: {
                        meterId: 1,
                        date: dayJsDate(2022, 2, 20), // niedziela
                        totalYield: 200,
                        charged: 2000,
                        donated: 1000,
                    },
                },
            ])
        })

        test('getYieldRecordsForRange - miesięczny zakres danych', () => {
            const actual = getYieldRecordsForRange(values, DataRange.Month)
            expect(actual).toEqual([
                {
                    date: dayJsDateWithProperty(2022, 1, 31),
                    values: {
                        meterId: 1,
                        date: dayJsDate(2022, 1, 31), // poniedziałek
                        totalYield: 60,
                    },
                },
                {
                    date: dayJsDateWithProperty(2022, 2, 20),
                    values: {
                        meterId: 1,
                        date: dayJsDate(2022, 2, 20), // niedziela
                        totalYield: 200,
                        charged: 2000,
                        donated: 1000,
                    },
                },
            ])
        })

        test('getCompleteRecordsForRange - tygodniowy zakres danych', () => {
            const actual = getCompleteRecordsForRange(values, DataRange.Week)
            expect(actual).toEqual([
                {
                    date: dayJsDateWithProperty(2022, 1, 30),
                    values: {
                        meterId: 1,
                        date: dayJsDate(2022, 1, 30), // niedziela
                        totalYield: 50,
                        charged: 1000,
                        donated: 500,
                    },
                },
                {
                    date: dayJsDate(2022, 2, 6),
                    values: null,
                },
                {
                    date: dayJsDate(2022, 2, 13),
                    values: null,
                },
                {
                    date: dayJsDateWithProperty(2022, 2, 20),
                    values: {
                        meterId: 1,
                        date: dayJsDate(2022, 2, 20), // niedziela
                        totalYield: 200,
                        charged: 2000,
                        donated: 1000,
                    },
                },
            ])
        })

        test('getCompleteRecordsForRange - miesięczny zakres danych', () => {
            const actual = getCompleteRecordsForRange(values, DataRange.Month)
            expect(actual).toEqual([
                // nie zawiera w ogóle danych dla stycznia, gdyż rekord dla 31.01 nie jest typu Complete
                // @todo czy wsparcie potrzebne?
                {
                    date: dayJsDateWithProperty(2022, 2, 20),
                    values: {
                        meterId: 1,
                        date: dayJsDate(2022, 2, 20), // niedziela
                        totalYield: 200,
                        charged: 2000,
                        donated: 1000,
                    },
                },
            ])
        })
    })
})
