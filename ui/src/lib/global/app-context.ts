import type { SolarData } from 'schema'
import type { MetersDataHelper, TimeVaryingValuesHelper } from 'calculation'
import { getContext, setContext } from 'svelte'

export interface AppContext {
    data: SolarData
    url: string

    metersHelper: MetersDataHelper
    timeVaryingHelper: TimeVaryingValuesHelper
}

const key = Symbol()

export const setAppContext = (data: AppContext) => setContext(key, data)
export const getAppContext = () => getContext<AppContext>(key)
