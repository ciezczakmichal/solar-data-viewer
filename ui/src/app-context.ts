import type { DataFormat } from 'format'
import type { MetersDataHelper } from 'calculation'
import { getContext, setContext } from 'svelte'

export interface AppContext {
    getUrl(): string
    getData(): DataFormat

    getMetersHelper(): MetersDataHelper
}

export interface AppContextValues {
    url: string
    data: DataFormat

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
