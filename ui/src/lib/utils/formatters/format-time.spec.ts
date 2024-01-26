import { dayJsDate } from 'calculation'
import { DurationFormatFlag, formatDuration } from './format-time'

describe('formatDuration - wersja z obiektem DateRange (from / to)', () => {
    describe('zwraca poprawną wartość dla następujących po sobie dat', () => {
        it('w środku miesiąca', () => {
            const data = {
                from: dayJsDate(2022, 3, 22),
                to: dayJsDate(2022, 3, 23),
            }
            expect(formatDuration(data)).toEqual('1 dzień')
        })

        it('na przełomie miesiąca', () => {
            const data = {
                from: dayJsDate(2022, 2, 28),
                to: dayJsDate(2022, 3, 1),
            }
            expect(formatDuration(data)).toEqual('1 dzień')
        })
    })

    it('zwraca wyłącznie liczbę dni, gdy nie ma pełnego miesiąca', () => {
        let data = {
            from: dayJsDate(2021, 10, 12),
            to: dayJsDate(2021, 10, 17),
        }
        expect(formatDuration(data)).toEqual('5 dni')

        data = {
            from: dayJsDate(2022, 1, 1),
            to: dayJsDate(2022, 1, 31),
        }
        expect(formatDuration(data)).toEqual('30 dni')
    })

    it('zwraca wyłącznie ilość miesięcy dla dat o tym samym dniu w miesiącu', () => {
        let data = {
            from: dayJsDate(2021, 2, 23),
            to: dayJsDate(2021, 3, 23),
        }
        expect(formatDuration(data)).toEqual('1 miesiąc')

        data = {
            from: dayJsDate(2021, 10, 12),
            to: dayJsDate(2022, 6, 12),
        }
        expect(formatDuration(data)).toEqual('8 miesięcy')

        data = {
            from: dayJsDate(2022, 1, 31),
            to: dayJsDate(2022, 12, 31),
        }
        expect(formatDuration(data)).toEqual('11 miesięcy')
    })

    it('zwraca poprawną wartość, gdy brakuje kilku dni do pełnego roku', () => {
        let data = {
            from: dayJsDate(2021, 6, 15),
            to: dayJsDate(2022, 6, 10),
        }
        expect(formatDuration(data)).toEqual('11 miesięcy, 25 dni')

        data = {
            from: dayJsDate(2020, 4, 1),
            to: dayJsDate(2021, 3, 31),
        }
        expect(formatDuration(data)).toEqual('11 miesięcy, 30 dni')
    })

    // @todo test gdy brakuje dnia do pełnej liczby miesięcy (sprawdzić liczenie w zależności od długości miesiąca)

    it('zwraca wyłącznie liczbę lat dla identycznych dat poza numerem roku', () => {
        let data = {
            from: dayJsDate(2020, 7, 5),
            to: dayJsDate(2021, 7, 5),
        }
        expect(formatDuration(data)).toEqual('1 rok')

        data = {
            from: dayJsDate(2019, 11, 25),
            to: dayJsDate(2022, 11, 25),
        }
        expect(formatDuration(data)).toEqual('3 lata')

        // @todo testy - początek miesiąca, środek oraz koniec
    })

    it('zwraca poprawne wartości dla różnych lat, miesięcy i dni', () => {
        let data = {
            from: dayJsDate(2021, 10, 12),
            to: dayJsDate(2022, 6, 20),
        }
        expect(formatDuration(data)).toEqual('8 miesięcy, 8 dni')

        data = {
            from: dayJsDate(2020, 3, 5),
            to: dayJsDate(2022, 12, 15),
        }
        expect(formatDuration(data)).toEqual('2 lata, 9 miesięcy, 10 dni')

        data = {
            from: dayJsDate(2002, 12, 20),
            to: dayJsDate(2021, 3, 7),
        }
        expect(formatDuration(data)).toEqual('18 lat, 2 miesiące, 18 dni')
    })

    it('gdy pominięto liczenie dni - zwraca poprawne wartości dla różnych lat, miesięcy i dni', () => {
        const flag = DurationFormatFlag.OmitDays

        let data = {
            from: dayJsDate(2021, 10, 12),
            to: dayJsDate(2022, 6, 20),
        }
        expect(formatDuration(data, flag)).toEqual('8 miesięcy')

        data = {
            from: dayJsDate(2020, 3, 5),
            to: dayJsDate(2022, 12, 15),
        }
        expect(formatDuration(data, flag)).toEqual('2 lata, 9 miesięcy')

        data = {
            from: dayJsDate(2002, 12, 20),
            to: dayJsDate(2021, 3, 7),
        }
        expect(formatDuration(data, flag)).toEqual('18 lat, 2 miesiące')
    })
})
