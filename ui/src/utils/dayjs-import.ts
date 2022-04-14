import dayjs from 'dayjs'
import 'dayjs/locale/pl'
import localeData from 'dayjs/plugin/localeData'

dayjs.locale('pl') // zmiana globalnie
dayjs.extend(localeData)
