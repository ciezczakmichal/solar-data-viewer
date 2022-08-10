import { CompleteValuesRecord, MeterRecord } from 'format'
import { CalculationError } from './error'
import { EnergyCalculationInput, calculateEnergy } from './energy'
import { MetersDataHelper } from './meters-data-helper'

describe('calculateEnergy', () => {
    it('test obliczania liczby dni', () => {
        const values = {
            totalYield: 0,
            charged: 0,
            donated: 0,
        }

        const input: EnergyCalculationInput = {
            from: {
                meterId: 1,
                date: '2022-01-02', // niedziela
                ...values,
            },
            to: {
                meterId: 1,
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
                meterId: 1,
                date: '2022-01-02',
                totalYield: 0,
                charged: 0,
                donated: 0,
            },
            to: {
                meterId: 1,
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
                meterId: 1,
                date: '2022-01-02',
                totalYield: 0,
                charged: 0,
                donated: 0,
            },
            to: {
                meterId: 1,
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
                meterId: 1,
                date: '2022-01-02',
                totalYield: 0,
                charged: 0,
                donated: 0,
            },
            to: {
                meterId: 1,
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

    describe('obsługa liczników', () => {
        it('jeśli dane pochodzą z dwóch liczników, a brak obiektu helper-a, rzucany jest wyjątek', () => {
            const meters: MeterRecord[] = [
                {
                    id: 1,
                    installationDate: '2022-01-01',
                    initialValues: {
                        totalYield: 0,
                        charged: 0,
                        donated: 0,
                    },
                },
                {
                    id: 2,
                    installationDate: '2022-02-01',
                    initialValues: {
                        totalYield: 0,
                    },
                },
            ]

            const values: CompleteValuesRecord[] = [
                {
                    meterId: 1,
                    date: '2022-02-01',
                    totalYield: 10,
                    charged: 10,
                    donated: 10,
                },
                {
                    meterId: 2,
                    date: '2022-02-15',
                    totalYield: 20,
                    charged: 20,
                    donated: 20,
                },
            ]

            const metersHelper = new MetersDataHelper({ meters, values })

            const input: EnergyCalculationInput = {
                from: metersHelper.getMeterInitialValuesAsCompleteRecord(1),
                to: values[1],
                plantProperties: {
                    installationPower: 1, // nieistone
                    energyInWarehouseFactor: 0.8,
                },
                // brak metersHelper
            }

            expect(() => calculateEnergy(input)).toThrow(CalculationError)
        })

        it('test obsługi dwóch liczników - każdy z wartościami początkowymi != 0', () => {
            const meters: MeterRecord[] = [
                {
                    id: 1,
                    installationDate: '2022-01-01',
                    initialValues: {
                        totalYield: 0,
                        charged: 1000,
                        donated: 100,
                    },
                },
                {
                    id: 2,
                    installationDate: '2022-02-01',
                    initialValues: {
                        charged: 50,
                        donated: 50,
                    },
                },
            ]

            const values: CompleteValuesRecord[] = [
                {
                    meterId: 1,
                    date: '2022-02-01',
                    totalYield: 100,
                    charged: 1300,
                    donated: 170,
                },
                {
                    meterId: 2,
                    date: '2022-02-15',
                    totalYield: 200,
                    charged: 180,
                    donated: 220,
                },
            ]

            const metersHelper = new MetersDataHelper({ meters, values })

            const input: EnergyCalculationInput = {
                from: metersHelper.getMeterInitialValuesAsCompleteRecord(1),
                to: values[1],
                plantProperties: {
                    installationPower: 1, // nieistone
                    energyInWarehouseFactor: 0.8,
                },
                metersHelper: metersHelper,
            }

            const result = calculateEnergy(input)
            expect(result.totalYield).toEqual(200)
            expect(result.charged).toEqual(430) // 1300 - 1000 + 180 - 50
            expect(result.donated).toEqual(240) // 170 - 100 + 220 - 50
        })
    })

    // @todo 3 wymiany licznika
})
