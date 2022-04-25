import { EnergyCalculationInput, calculateEnergy } from './calculation'

describe('calculation', () => {
    it('test obliczania liczby dni', () => {
        const values = {
            totalYield: 0,
            charged: 0,
            donated: 0,
        }

        const input: EnergyCalculationInput = {
            from: {
                date: '2022-01-02', // niedziela
                ...values,
            },
            to: {
                date: '2022-01-09', // niedziela
                ...values,
            },
            plantProperties: {
                // nieistone
                installationPower: 1,
                energyInWarehouseFactor: 1,
            },
        }

        const result = calculateEnergy(input)
        expect(result.days).toEqual(7)
    })
})
