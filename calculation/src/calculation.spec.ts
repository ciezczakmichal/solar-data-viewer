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

    it('test pełnego bilansowania - wersja z 0% autokonsumpcji', () => {
        const input: EnergyCalculationInput = {
            from: {
                date: '2022-01-02',
                totalYield: 0,
                charged: 0,
                donated: 0,
            },
            to: {
                date: '2022-01-09',
                totalYield: 150,
                charged: 120,
                donated: 150,
            },
            plantProperties: {
                installationPower: 1, // nieistone
                energyInWarehouseFactor: 0.8,
            },
        }

        const result = calculateEnergy(input)
        expect(result.fulfillNeeds).toEqual(true)
        expect(result.savedEnergy).toEqual(120)
        expect(result.needsFulfilmentPercent).toEqual(1)
        expect(result.energyToBuy).toEqual(0)
        expect(result.energyToCharge).toEqual(0)
    })

    it('test pełnego bilansowania - wersja z 100% autokonsumpcji', () => {
        const input: EnergyCalculationInput = {
            from: {
                date: '2022-01-02',
                totalYield: 0,
                charged: 0,
                donated: 0,
            },
            to: {
                date: '2022-01-09',
                totalYield: 150,
                charged: 0,
                donated: 0,
            },
            plantProperties: {
                installationPower: 1, // nieistone
                energyInWarehouseFactor: 0.8,
            },
        }

        const result = calculateEnergy(input)
        expect(result.fulfillNeeds).toEqual(true)
        expect(result.savedEnergy).toEqual(150)
        expect(result.needsFulfilmentPercent).toEqual(1)
        expect(result.energyToBuy).toEqual(0)
        expect(result.energyToCharge).toEqual(0)
    })

    it('test liczenia nadwyżki', () => {
        const input: EnergyCalculationInput = {
            from: {
                date: '2022-01-02',
                totalYield: 0,
                charged: 0,
                donated: 0,
            },
            to: {
                date: '2022-01-09',
                totalYield: 150,
                charged: 100,
                donated: 150, // 120 dostępne do pobrania
            },
            plantProperties: {
                installationPower: 1, // nieistone
                energyInWarehouseFactor: 0.8,
            },
        }

        const result = calculateEnergy(input)
        expect(result.fulfillNeeds).toEqual(true)
        expect(result.savedEnergy).toEqual(100)
        expect(result.needsFulfilmentPercent).toEqual(1)
        expect(result.energyToBuy).toEqual(0)
        expect(result.energyToCharge).toEqual(20)
    })
})
