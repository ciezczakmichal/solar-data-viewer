import '../dayjs-import'
import { DurationFormatFlag, formatDuration } from './format-time'

describe('formatDuration - wersja z obiektem Duration (from / to)', () => {
    describe('zwraca poprawną wartość dla następujących po sobie dat', () => {
        it('w środku miesiąca', () => {
            const data = { from: '2022-03-22', to: '2022-03-23' }
            expect(formatDuration(data)).toEqual('1 dzień')
        })

        it('na przełomie miesiąca', () => {
            const data = { from: '2022-02-28', to: '2022-03-01' }
            expect(formatDuration(data)).toEqual('1 dzień')
        })
    })

    it('zwraca wyłącznie liczbę dni, gdy nie ma pełnego miesiąca', () => {
        let data = { from: '2021-10-12', to: '2021-10-17' }
        expect(formatDuration(data)).toEqual('5 dni')

        data = { from: '2022-01-01', to: '2022-01-31' }
        expect(formatDuration(data)).toEqual('30 dni')
    })

    it('zwraca wyłącznie ilość miesięcy dla dat o tym samym dniu w miesiącu', () => {
        let data = { from: '2021-02-23', to: '2021-03-23' }
        expect(formatDuration(data)).toEqual('1 miesiąc')

        data = { from: '2021-10-12', to: '2022-06-12' }
        expect(formatDuration(data)).toEqual('8 miesięcy')

        data = { from: '2022-01-31', to: '2022-12-31' }
        expect(formatDuration(data)).toEqual('11 miesięcy')
    })

    // @todo test gdy brakuje dnia do pełnej liczby miesięcy (sprawdzić liczenie w zależności od długości miesiąca)

    it('zwraca wyłącznie liczbę lat dla identycznych dat poza numerem roku', () => {
        let data = { from: '2020-07-05', to: '2021-07-05' }
        expect(formatDuration(data)).toEqual('1 rok')

        data = { from: '2019-11-25', to: '2022-11-25' }
        expect(formatDuration(data)).toEqual('3 lata')

        // @todo testy - początek miesiąca, środek oraz koniec
    })

    it('zwraca poprawne wartości dla różnych lat, miesięcy i dni', () => {
        let data = { from: '2021-10-12', to: '2022-06-20' }
        expect(formatDuration(data)).toEqual('8 miesięcy, 8 dni')

        data = { from: '2020-03-05', to: '2022-12-15' }
        expect(formatDuration(data)).toEqual('2 lata, 9 miesięcy, 10 dni')

        data = { from: '2002-12-20', to: '2021-03-07' }
        expect(formatDuration(data)).toEqual('18 lat, 2 miesiące, 18 dni')
    })

    it('gdy pominięto liczenie dni - zwraca poprawne wartości dla różnych lat, miesięcy i dni', () => {
        const flag = DurationFormatFlag.OmitDays

        let data = { from: '2021-10-12', to: '2022-06-20' }
        expect(formatDuration(data, flag)).toEqual('8 miesięcy')

        data = { from: '2020-03-05', to: '2022-12-15' }
        expect(formatDuration(data, flag)).toEqual('2 lata, 9 miesięcy')

        data = { from: '2002-12-20', to: '2021-03-07' }
        expect(formatDuration(data, flag)).toEqual('18 lat, 2 miesiące')
    })
})
