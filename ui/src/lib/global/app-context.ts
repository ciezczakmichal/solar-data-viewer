import type { MetersDataHelper, TimeVaryingValuesHelper } from 'calculation'
import type { CompleteValuesRecord, SolarData } from 'schema'
import { getContext, setContext } from 'svelte'

export interface AppContext {
    data: SolarData
    url: string

    from: CompleteValuesRecord
    to: CompleteValuesRecord

    metersHelper: MetersDataHelper
    timeVaryingHelper: TimeVaryingValuesHelper
}

const key = Symbol()

export const setAppContext = (data: AppContext) => setContext(key, data)
export const getAppContext = () => getContext<AppContext>(key)
