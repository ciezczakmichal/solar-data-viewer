import { TariffItem } from 'format'
import { calculateEnergyCost } from './energy-cost'

describe('calculateEnergyCost', () => {
    it('test obliczania kosztu energii - na podstawie faktury P/22215359/0004/21', () => {
        const tariff: TariffItem[] = [
            {
                name: 'Energia czynna',
                factorNetto: 0.3015, // inna niż w bazie
                // netto 87,44
            },
            {
                name: 'Opłata jakościowa',
                factorNetto: 0.0102,
                // netto 2,96
            },
            {
                name: 'Opłata zmienna sieciowa',
                factorNetto: 0.1648,
                // netto 47,79
            },
            {
                name: 'Opłata OZE',
                factorNetto: 0.0022,
                // netto 0,64
            },
            {
                name: 'Opłata kogeneracyjna',
                factorNetto: 0.0,
            },
        ]

        // netto razem: 138,83

        const cost = calculateEnergyCost(290, tariff)
        expect(cost.value).toEqual(170.76)
    })
})
