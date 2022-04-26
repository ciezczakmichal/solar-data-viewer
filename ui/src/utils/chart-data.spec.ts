import dayjs, { type Dayjs } from 'dayjs'
import { parseDate } from 'calculation'
import { DateFormat, type ValuesRecord } from 'format'
import {
    DataRange,
    getCompleteRecordsForRange,
    getRecordsForRange,
    getYieldRecordsForRange,
} from './chart-data'

// miesiąc tak jak wyświetlany (czyli 1 = styczeń)
function dayJsInstance(year: number, month: number, day: number): Dayjs {
    return dayjs(new Date(year, month - 1, day))
}

// miesiąc tak jak wyświetlany (czyli 1 = styczeń)
function dayJsInstanceWithExtraProperty(
    year: number,
    month: number,
    day: number
): Dayjs {
    const instance = dayjs(new Date(year, month - 1, day))
    // sformatuj i parsuj - aby wewnętrzna reprezentacja obiektu się zgadzała
    // inaczej była różnica na właściwości "$x"
    return parseDate(instance.format(DateFormat))
}

describe('chart-data', () => {
    describe('getRecordsForRange - podstawowy test zwracania rekordów', () => {
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
                date: '2022-05-08', // niedziela
                totalYield: 270,
            },
        ]

        it('tygodniowy zakres danych', () => {
            const actual = getRecordsForRange(values, DataRange.Week)

            expect(actual).toEqual([
                {
                    date: dayJsInstanceWithExtraProperty(2022, 3, 20),
                    values: {
                        date: '2022-03-20', // niedziela
                        totalYield: 123,
                    },
                },
                {
                    date: dayJsInstanceWithExtraProperty(2022, 3, 27),
                    values: {
                        date: '2022-03-27', // niedziela
                        totalYield: 150,
                    },
                },
                {
                    date: dayJsInstance(2022, 4, 3),
                    values: null,
                },
                {
                    date: dayJsInstance(2022, 4, 10),
                    values: null,
                },
                {
                    date: dayJsInstance(2022, 4, 17),
                    values: null,
                },
                {
                    date: dayJsInstance(2022, 4, 24),
                    values: null,
                },
                {
                    date: dayJsInstance(2022, 5, 1),
                    values: null,
                },
                {
                    date: dayJsInstanceWithExtraProperty(2022, 5, 8),
                    values: {
                        date: '2022-05-08', // niedziela
                        totalYield: 270,
                    },
                },
            ])
        })

        it('miesięczny zakres danych', () => {
            const actual = getRecordsForRange(values, DataRange.Month)
            expect(actual).toEqual([
                {
                    date: dayJsInstanceWithExtraProperty(2022, 3, 31),
                    values: {
                        date: '2022-03-31', // czwartek
                        charged: 1123,
                        donated: 120,
                    },
                },
                {
                    date: dayJsInstance(2022, 4, 30),
                    values: null,
                },
                {
                    date: dayJsInstanceWithExtraProperty(2022, 5, 8),
                    values: {
                        date: '2022-05-08', // niedziela
                        totalYield: 270,
                    },
                },
            ])
        })
    })

    describe('get[...]RecordsForRange zwracają NULL, gdy dane dnia występują, lecz nie pasują do typu', () => {
        const values: ValuesRecord[] = [
            {
                date: '2022-01-30', // niedziela
                totalYield: 50,
                charged: 1000,
                donated: 500,
            },
            {
                date: '2022-01-31', // poniedziałek
                totalYield: 60,
            },
            {
                date: '2022-02-06', // niedziela
                totalYield: 70,
            },
            {
                date: '2022-02-10', // czwartek
                totalYield: 100,
            },
            {
                date: '2022-02-13', // niedziela
                charged: 1500,
                donated: 800,
            },
            {
                date: '2022-02-20', // niedziela
                totalYield: 200,
                charged: 2000,
                donated: 1000,
            },
        ]

        it('getYieldRecordsForRange - tygodniowy zakres danych', () => {
            const actual = getYieldRecordsForRange(values, DataRange.Week)
            expect(actual).toEqual([
                {
                    date: dayJsInstanceWithExtraProperty(2022, 1, 30),
                    values: {
                        date: '2022-01-30', // niedziela
                        totalYield: 50,
                        charged: 1000,
                        donated: 500,
                    },
                },
                {
                    date: dayJsInstanceWithExtraProperty(2022, 2, 6),
                    values: {
                        date: '2022-02-06', // niedziela
                        totalYield: 70,
                    },
                },
                {
                    date: dayJsInstance(2022, 2, 13),
                    values: null,
                },
                {
                    date: dayJsInstanceWithExtraProperty(2022, 2, 20),
                    values: {
                        date: '2022-02-20', // niedziela
                        totalYield: 200,
                        charged: 2000,
                        donated: 1000,
                    },
                },
            ])
        })

        it('getYieldRecordsForRange - miesięczny zakres danych', () => {
            const actual = getYieldRecordsForRange(values, DataRange.Month)
            expect(actual).toEqual([
                {
                    date: dayJsInstanceWithExtraProperty(2022, 1, 31),
                    values: {
                        date: '2022-01-31', // poniedziałek
                        totalYield: 60,
                    },
                },
                {
                    date: dayJsInstanceWithExtraProperty(2022, 2, 20),
                    values: {
                        date: '2022-02-20', // niedziela
                        totalYield: 200,
                        charged: 2000,
                        donated: 1000,
                    },
                },
            ])
        })

        it('getCompleteRecordsForRange - tygodniowy zakres danych', () => {
            const actual = getCompleteRecordsForRange(values, DataRange.Week)
            expect(actual).toEqual([
                {
                    date: dayJsInstanceWithExtraProperty(2022, 1, 30),
                    values: {
                        date: '2022-01-30', // niedziela
                        totalYield: 50,
                        charged: 1000,
                        donated: 500,
                    },
                },
                {
                    date: dayJsInstance(2022, 2, 6),
                    values: null,
                },
                {
                    date: dayJsInstance(2022, 2, 13),
                    values: null,
                },
                {
                    date: dayJsInstanceWithExtraProperty(2022, 2, 20),
                    values: {
                        date: '2022-02-20', // niedziela
                        totalYield: 200,
                        charged: 2000,
                        donated: 1000,
                    },
                },
            ])
        })

        it('getCompleteRecordsForRange - miesięczny zakres danych', () => {
            const actual = getCompleteRecordsForRange(values, DataRange.Month)
            expect(actual).toEqual([
                {
                    date: dayJsInstanceWithExtraProperty(2022, 2, 20),
                    values: {
                        date: '2022-02-20', // niedziela
                        totalYield: 200,
                        charged: 2000,
                        donated: 1000,
                    },
                },
            ])
        })
    })
})
