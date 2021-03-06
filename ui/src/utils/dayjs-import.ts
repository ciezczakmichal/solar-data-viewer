import dayjs from 'dayjs'
import 'dayjs/locale/pl'
import localeData from 'dayjs/plugin/localeData'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import duration from 'dayjs/plugin/duration'

dayjs.locale('pl') // zmiana globalnie

dayjs.extend(localeData) // wymagane przez dayjs.months()
dayjs.extend(localizedFormat) // wymagane przez date.format('L')
dayjs.extend(duration) // wymagane przez dayjs.duration()
