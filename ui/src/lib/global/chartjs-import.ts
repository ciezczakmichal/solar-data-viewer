// importowanie wszystkich składowych chart.js
// import 'chart.js/auto

// importowanie wybranych składowych chart.js w celu zmniejszenia rozmiaru aplikacji
import {
    BarController,
    BarElement,
    CategoryScale,
    Chart,
    Legend,
    LinearScale,
    LineController,
    LineElement,
    PointElement,
    Tooltip,
} from 'chart.js'

Chart.register(
    BarElement,
    LineElement,
    PointElement,

    BarController,
    LineController,

    LinearScale,
    CategoryScale,

    Legend,
    Tooltip,
)
