import { beforeEach, describe, expect, test } from 'vitest'
import type { DateRange } from '../utils/date-range.js'
import { dayJsDate, dayJsDateWithProperty } from '../utils/tests-utils.js'
import { VariableValueHolder, type ValueItem } from './variable-value-holder.js'

describe('VariableValueHolder', () => {
    let instance: VariableValueHolder<ValueItem>

    beforeEach(() => {
        const items: ValueItem[] = [
            {
                from: dayJsDate(2020, 1, 1),
                value: 1,
            },
            {
                from: dayJsDate(2020, 6, 1),
                value: 50,
            },
            {
                from: dayJsDate(2035, 8, 23),
                value: 35,
            },
        ]

        instance = new VariableValueHolder(items)
    })

    test('valueForDate', () => {
        let result: number | null

        result = instance.valueForDate(dayJsDate(2010, 2, 3))
        expect(result).toEqual(null)

        result = instance.valueForDate(dayJsDate(2019, 12, 31))
        expect(result).toEqual(null)

        result = instance.valueForDate(dayJsDate(2020, 1, 1))
        expect(result).toEqual(1)

        result = instance.valueForDate(dayJsDate(2020, 5, 31))
        expect(result).toEqual(1)

        result = instance.valueForDate(dayJsDate(2020, 6, 1))
        expect(result).toEqual(50)

        result = instance.valueForDate(dayJsDate(2035, 8, 22))
        expect(result).toEqual(50)

        result = instance.valueForDate(dayJsDate(2035, 8, 23))
        expect(result).toEqual(35)

        result = instance.valueForDate(dayJsDate(2100, 5, 5))
        expect(result).toEqual(35)
    })

    test('valueChangeDates', () => {
        expect(instance.valueChangeDates()).toEqual([
            dayJsDateWithProperty(2020, 1, 1),
            dayJsDateWithProperty(2020, 6, 1),
            dayJsDateWithProperty(2035, 8, 23),
        ])
    })

    test('changesWithinRange', () => {
        let range: DateRange

        range = {
            from: dayJsDate(2019, 3, 3),
            to: dayJsDate(2019, 12, 31),
        }
        expect(instance.changesWithinRange(range)).toEqual(false)

        range = {
            from: dayJsDate(2019, 12, 31),
            to: dayJsDate(2020, 1, 1),
        }
        expect(instance.changesWithinRange(range)).toEqual(true)

        range = {
            from: dayJsDate(2020, 1, 1),
            to: dayJsDate(2020, 5, 31),
        }
        expect(instance.changesWithinRange(range)).toEqual(false)

        range = {
            from: dayJsDate(2019, 5, 12),
            to: dayJsDate(2030, 9, 29),
        }
        expect(instance.changesWithinRange(range)).toEqual(true)
    })
})
