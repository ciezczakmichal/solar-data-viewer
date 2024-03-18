import { CompleteValuesRecord, MeterRecord } from 'schema'
import { describe, expect, test } from 'vitest'
import { EnergyCalculationInput, calculateEnergy } from './energy.js'
import { CalculationError } from './error.js'
import { MetersDataHelper } from './meters-data-helper.js'
import { dayJsDate } from './utils/tests-utils.js'

describe('calculateEnergy', () => {
    test('test obliczania liczby dni', () => {
        const values = {
            totalYield: 0,
            charged: 0,
            donated: 0,
        }

        const input: EnergyCalculationInput = {
            from: {
                meterId: 1,
                date: dayJsDate(2022, 1, 2), // niedziela
                ...values,
            },
            to: {
                meterId: 1,
                date: dayJsDate(2022, 1, 9), // niedziela
                ...values,
            },
            plantProperties: {
                // nieistotne
                installationPower: 1,
                energyInWarehouseFactor: 1,
            },
        }

        const result = calculateEnergy(input)
        expect(result.days).toEqual(7)
    })

    test('test obliczania liczby dni - gdy zdefiniowano licznik', () => {
        const meters: MeterRecord[] = [
            {
                id: 1,
                installationDate: dayJsDate(2022, 5, 13),
                initialValues: {
                    totalYield: 0,
                    charged: 0,
                    donated: 0,
                },
            },
        ]

        const values: CompleteValuesRecord[] = [
            {
                meterId: 1,
                date: dayJsDate(2022, 5, 15),
                totalYield: 0,
                charged: 0,
                donated: 0,
            },
        ]

        const metersHelper = new MetersDataHelper({ meters, values })

        const input: EnergyCalculationInput = {
            from: metersHelper.getMeterInitialValuesAsCompleteRecord(1),
            to: values[0],
            plantProperties: {
                // nieistotne
                installationPower: 1,
                energyInWarehouseFactor: 1,
            },
            metersHelper,
        }

        const result = calculateEnergy(input)
        expect(result.days).toEqual(2)
    })

    test('test pełnego bilansowania - wersja z 0% autokonsumpcji', () => {
        const input: EnergyCalculationInput = {
            from: {
                meterId: 1,
                date: dayJsDate(2022, 1, 2),
                totalYield: 0,
                charged: 0,
                donated: 0,
            },
            to: {
                meterId: 1,
                date: dayJsDate(2022, 1, 9),
                totalYield: 150,
                charged: 120,
                donated: 150,
            },
            plantProperties: {
                installationPower: 1, // nieistotne
                energyInWarehouseFactor: 0.8,
            },
        }

        const result = calculateEnergy(input)
        expect(result.fulfillNeeds).toEqual(true)
        expect(result.savedEnergy).toEqual(120)
        expect(result.demandFulfillmentPercent).toEqual(1)
        expect(result.energyToBuy).toEqual(0)
        expect(result.energyToCharge).toEqual(0)
        expect(result.energyToChargeOrBuy).toEqual(0)
    })

    test('test pełnego bilansowania - wersja z 100% autokonsumpcji', () => {
        const input: EnergyCalculationInput = {
            from: {
                meterId: 1,
                date: dayJsDate(2022, 1, 2),
                totalYield: 0,
                charged: 0,
                donated: 0,
            },
            to: {
                meterId: 1,
                date: dayJsDate(2022, 1, 9),
                totalYield: 150,
                charged: 0,
                donated: 0,
            },
            plantProperties: {
                installationPower: 1, // nieistotne
                energyInWarehouseFactor: 0.8,
            },
        }

        const result = calculateEnergy(input)
        expect(result.fulfillNeeds).toEqual(true)
        expect(result.savedEnergy).toEqual(150)
        expect(result.demandFulfillmentPercent).toEqual(1)
        expect(result.energyToBuy).toEqual(0)
        expect(result.energyToCharge).toEqual(0)
        expect(result.energyToChargeOrBuy).toEqual(0)
    })

    test('test liczenia nadwyżki', () => {
        const input: EnergyCalculationInput = {
            from: {
                meterId: 1,
                date: dayJsDate(2022, 1, 2),
                totalYield: 0,
                charged: 0,
                donated: 0,
            },
            to: {
                meterId: 1,
                date: dayJsDate(2022, 1, 9),
                totalYield: 150,
                charged: 100,
                donated: 150, // 120 dostępne do pobrania
            },
            plantProperties: {
                installationPower: 1, // nieistotne
                energyInWarehouseFactor: 0.8,
            },
        }

        const result = calculateEnergy(input)
        expect(result.fulfillNeeds).toEqual(true)
        expect(result.savedEnergy).toEqual(100)
        expect(result.demandFulfillmentPercent).toEqual(1)
        expect(result.energyToBuy).toEqual(0)
        expect(result.energyToCharge).toEqual(20)
        expect(result.energyToChargeOrBuy).toEqual(20)
    })

    describe('obsługa liczników', () => {
        test('jeśli dane pochodzą z dwóch liczników, a brak obiektu helper-a, rzucany jest wyjątek', () => {
            const meters: MeterRecord[] = [
                {
                    id: 1,
                    installationDate: dayJsDate(2022, 1, 1),
                    initialValues: {
                        totalYield: 0,
                        charged: 0,
                        donated: 0,
                    },
                },
                {
                    id: 2,
                    installationDate: dayJsDate(2022, 2, 1),
                    initialValues: {
                        totalYield: 0,
                    },
                },
            ]

            const values: CompleteValuesRecord[] = [
                {
                    meterId: 1,
                    date: dayJsDate(2022, 2, 1),
                    totalYield: 10,
                    charged: 10,
                    donated: 10,
                },
                {
                    meterId: 2,
                    date: dayJsDate(2022, 2, 15),
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
                    installationPower: 1, // nieistotne
                    energyInWarehouseFactor: 0.8,
                },
                // brak metersHelper
            }

            expect(() => calculateEnergy(input)).toThrow(CalculationError)
        })

        test('test obsługi dwóch liczników - każdy z wartościami początkowymi != 0', () => {
            const meters: MeterRecord[] = [
                {
                    id: 1,
                    installationDate: dayJsDate(2022, 1, 1),
                    initialValues: {
                        totalYield: 0,
                        charged: 1000,
                        donated: 100,
                    },
                },
                {
                    id: 2,
                    installationDate: dayJsDate(2022, 2, 1),
                    initialValues: {
                        charged: 50,
                        donated: 50,
                    },
                },
            ]

            const values: CompleteValuesRecord[] = [
                {
                    meterId: 1,
                    date: dayJsDate(2022, 2, 1),
                    totalYield: 100,
                    charged: 1300,
                    donated: 170,
                },
                {
                    meterId: 2,
                    date: dayJsDate(2022, 2, 15),
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
                    installationPower: 1, // nieistotne
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

    test('test obsługi trzech liczników - każdy z różnymi, wybranymi wartościami', () => {
        const meters: MeterRecord[] = [
            {
                id: 1,
                installationDate: dayJsDate(2022, 1, 1),
                initialValues: {
                    totalYield: 0,
                    charged: 20000,
                    donated: 1000,
                },
            },
            {
                id: 2,
                installationDate: dayJsDate(2022, 2, 1),
                initialValues: {
                    charged: 0,
                    donated: 0,
                },
            },
            {
                // nowy falownik
                id: 3,
                installationDate: dayJsDate(2022, 3, 1),
                initialValues: {
                    totalYield: 0,
                },
            },
        ]

        const values: CompleteValuesRecord[] = [
            {
                meterId: 1,
                date: dayJsDate(2022, 2, 1),
                totalYield: 500,
                charged: 20300,
                donated: 1400,
            },
            {
                meterId: 2,
                date: dayJsDate(2022, 3, 1),
                totalYield: 800,
                charged: 100,
                donated: 200,
            },
            {
                meterId: 3,
                date: dayJsDate(2022, 3, 15),
                totalYield: 300,
                charged: 350,
                donated: 400,
            },
        ]

        const metersHelper = new MetersDataHelper({ meters, values })

        const input: EnergyCalculationInput = {
            from: metersHelper.getMeterInitialValuesAsCompleteRecord(1),
            to: values[2],
            plantProperties: {
                installationPower: 1, // nieistotne
                energyInWarehouseFactor: 0.8,
            },
            metersHelper: metersHelper,
        }

        const result = calculateEnergy(input)
        expect(result.totalYield).toEqual(1100) // 800 + 300
        expect(result.charged).toEqual(650) // 20300 - 20000 + 100 - 0 + 350 - 100
        expect(result.donated).toEqual(800) // 1400 - 1000 + 200 - 0 + 400 - 200
    })
})
