import { DateRange } from '../utils/date-range'
import {
    dayJsInstance,
    dayJsInstanceWithExtraProperty,
} from '../utils/tests-utils'
import { ValueItem, VariableValueHolder } from './variable-value-holder'

describe('VariableValueHolder', () => {
    let instance: VariableValueHolder<ValueItem>

    beforeEach(() => {
        const items: ValueItem[] = [
            {
                from: dayJsInstance(2020, 1, 1),
                value: 1,
            },
            {
                from: dayJsInstance(2020, 6, 1),
                value: 50,
            },
            {
                from: dayJsInstance(2035, 8, 23),
                value: 35,
            },
        ]

        instance = new VariableValueHolder(items)
    })

    it('valueForDate', () => {
        let result: number | null

        result = instance.valueForDate(dayJsInstance(2010, 2, 3))
        expect(result).toEqual(null)

        result = instance.valueForDate(dayJsInstance(2019, 12, 31))
        expect(result).toEqual(null)

        result = instance.valueForDate(dayJsInstance(2020, 1, 1))
        expect(result).toEqual(1)

        result = instance.valueForDate(dayJsInstance(2020, 5, 31))
        expect(result).toEqual(1)

        result = instance.valueForDate(dayJsInstance(2020, 6, 1))
        expect(result).toEqual(50)

        result = instance.valueForDate(dayJsInstance(2035, 8, 22))
        expect(result).toEqual(50)

        result = instance.valueForDate(dayJsInstance(2035, 8, 23))
        expect(result).toEqual(35)

        result = instance.valueForDate(dayJsInstance(2100, 5, 5))
        expect(result).toEqual(35)
    })

    it('valueChangeDates', () => {
        expect(instance.valueChangeDates()).toEqual([
            dayJsInstanceWithExtraProperty(2020, 1, 1),
            dayJsInstanceWithExtraProperty(2020, 6, 1),
            dayJsInstanceWithExtraProperty(2035, 8, 23),
        ])
    })

    it('changesWithinRange', () => {
        let range: DateRange

        range = {
            from: dayJsInstance(2019, 3, 3),
            to: dayJsInstance(2019, 12, 31),
        }
        expect(instance.changesWithinRange(range)).toEqual(false)

        range = {
            from: dayJsInstance(2019, 12, 31),
            to: dayJsInstance(2020, 1, 1),
        }
        expect(instance.changesWithinRange(range)).toEqual(true)

        range = {
            from: dayJsInstance(2020, 1, 1),
            to: dayJsInstance(2020, 5, 31),
        }
        expect(instance.changesWithinRange(range)).toEqual(false)

        range = {
            from: dayJsInstance(2019, 5, 12),
            to: dayJsInstance(2030, 9, 29),
        }
        expect(instance.changesWithinRange(range)).toEqual(true)
    })
})
