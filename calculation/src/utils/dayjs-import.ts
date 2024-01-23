import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'

dayjs.extend(customParseFormat) // wymagane przez parseDate()
dayjs.extend(isSameOrBefore) // wymagane przez dayjs.isSameOrBefore()
