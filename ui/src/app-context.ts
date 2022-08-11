import type { SolarDataFormat } from 'format'
import type { MetersDataHelper } from 'calculation'
import { getContext, setContext } from 'svelte'

export interface AppContext {
    getUrl(): string
    getData(): SolarDataFormat

    getMetersHelper(): MetersDataHelper
}

export interface AppContextValues {
    url: string
    data: SolarDataFormat

    metersHelper: MetersDataHelper
}

const key = Symbol()

export function setAppContext(data: AppContext) {
    setContext(key, data)
}

export function getAppContext(): AppContextValues {
    const { getUrl, getData, getMetersHelper } = getContext<AppContext>(key)

    return {
        url: getUrl(),
        data: getData(),
        metersHelper: getMetersHelper(),
    }
}
