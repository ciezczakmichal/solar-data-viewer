import { EnergyCalculationInput, calculateEnergy } from './calculation'

describe('calculation', () => {
    it('test obliczania liczby dni', () => {
        const input: EnergyCalculationInput = {
            from: {
                date: '2022-01-01',
                totalYield: 0,
                charged: 0,
                donated: 0,
            },
            to: {
                date: '2022-01-03',
                totalYield: 10,
                charged: 7,
                donated: 5,
            },
            plantProperties: {
                // nieistone
                installationPower: 1,
                energyInWarehouseFactor: 1,
            },
        }

        const result = calculateEnergy(input)
        expect(result.days).toEqual(2) // @todo
    })
})
