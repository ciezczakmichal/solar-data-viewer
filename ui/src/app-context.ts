import type { DataFormat } from 'format'
import { getContext, setContext } from 'svelte'

export interface AppContext {
    getUrl(): string
    getData(): DataFormat
}

export interface AppContextValues {
    url: string
    data: DataFormat
}

const key = Symbol()

export function setAppContext(data: AppContext) {
    setContext(key, data)
}

export function getAppContext(): AppContextValues {
    const { getUrl, getData } = getContext<AppContext>(key)

    return {
        url: getUrl(),
        data: getData(),
    }
}
