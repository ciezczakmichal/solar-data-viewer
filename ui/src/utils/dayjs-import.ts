import dayjs from 'dayjs'
import 'dayjs/locale/pl'
import localeData from 'dayjs/plugin/localeData'
import localizedFormat from 'dayjs/plugin/localizedFormat'

dayjs.locale('pl') // zmiana globalnie
dayjs.extend(localeData)
dayjs.extend(localizedFormat)
