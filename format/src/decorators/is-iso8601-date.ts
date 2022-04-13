import { Matches } from 'class-validator'

export function IsISO8601Date(): PropertyDecorator {
    return Matches(/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/)
}
