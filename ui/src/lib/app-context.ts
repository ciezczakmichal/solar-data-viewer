import type { SolarData } from 'schema'
import type { MetersDataHelper, TimeVaryingValuesHelper } from 'calculation'
import { getContext, setContext } from 'svelte'

export interface AppContext {
    getUrl(): string
    getData(): SolarData

    getMetersHelper(): MetersDataHelper
    getTimeVaryingHelper(): TimeVaryingValuesHelper
}

export interface AppContextValues {
    url: string
    data: SolarData

    metersHelper: MetersDataHelper
    timeVaryingHelper: TimeVaryingValuesHelper
}

const key = Symbol()

export function setAppContext(data: AppContext) {
    setContext(key, data)
}

export function getAppContext(): AppContextValues {
    const { getUrl, getData, getMetersHelper, getTimeVaryingHelper } =
        getContext<AppContext>(key)

    return {
        url: getUrl(),
        data: getData(),
        metersHelper: getMetersHelper(),
        timeVaryingHelper: getTimeVaryingHelper(),
    }
}
