import type { SolarData } from 'schema'
import { formatNumber } from './formatters/format-numbers'

export const AppTitle = 'Solar Data Viewer'

export function generateApplicationTitle(data: null | SolarData): string {
    if (!data) {
        return AppTitle
    }

    const { location, installationPower } = data.plantProperties
    let title = AppTitle

    if (location) {
        const powerString = formatNumber(installationPower) + ' kWp'
        title = `${location} ${powerString} | ${title}`
    }

    return title
}
