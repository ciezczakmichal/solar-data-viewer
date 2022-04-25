import type { ValuesRecord } from 'format'
import { DataRange, getRecordsForRange } from './chart-data'

describe('chart-data', () => {
    describe('podstawowy test zwracania odpowiednich rekordów', () => {
        const values: ValuesRecord[] = [
            {
                date: '2022-03-18', // piątek
                totalYield: 100,
            },
            {
                date: '2022-03-20', // niedziela
                totalYield: 123,
            },
            {
                date: '2022-03-23', // środa
                charged: 1050,
                donated: 12,
            },
            {
                date: '2022-03-27', // niedziela
                totalYield: 150,
            },
            {
                date: '2022-03-31', // czwartek
                charged: 1123,
                donated: 120,
            },
            {
                date: '2022-04-08', // piątek
                totalYield: 170,
            },
            {
                date: '2022-05-15', // niedziela
                totalYield: 270,
            },
        ]

        it('tygodniowy zakres danych', () => {
            const actual = getRecordsForRange(values, DataRange.Week)
            expect(actual).toEqual([
                {
                    date: '2022-03-20', // niedziela
                    totalYield: 123,
                },
                {
                    date: '2022-03-27', // niedziela
                    totalYield: 150,
                },
                {
                    date: '2022-05-15', // niedziela
                    totalYield: 270,
                },
            ])
        })

        it('miesięczny zakres danych', () => {
            const actual = getRecordsForRange(values, DataRange.Month)
            expect(actual).toEqual([
                {
                    date: '2022-03-31', // czwartek
                    charged: 1123,
                    donated: 120,
                },
                {
                    date: '2022-05-15', // niedziela
                    totalYield: 270,
                },
            ])
        })
    })
})
