import {Reducer} from 'redux'
import {createReducer} from './redux'
import {getStateFromStorage} from './storage'
import {Browser} from './browser'

export interface LargeString extends Setting {
    type: 'large_string'
}

export interface String extends Setting {
    type: 'string'
}

export interface Setting {
    type: string
    id: string
    label?: string
    initValue?: string | boolean
    placeholder?: string
    description?: string
    onSave?: (value: string) => void
}

export type Feature = {
    id: string
    name: string
    description?: string
    settings?: Setting[]
    toggleable?: boolean
    defaultIsActive?: boolean
    toggle?: (active: boolean) => void
    reducer?: Reducer
}

export interface Shortcut extends Setting {
    type: 'shortcut'
    onPress: () => void
}

export const Settings = {
    get: async (featureId: string, settingId: string, defaultValue?: string) =>
        (await getStateFromStorage())[featureId][settingId] || defaultValue,
    isActive: async (featureId: string) => (await getStateFromStorage())[featureId]?.active,
}

export const prepareSettings = (features: Feature[]): Feature[] => {
    return features.map((feature: Feature) => {
        if (feature.toggleable !== false) {
            feature.toggleable = true
        }
        if (feature.defaultIsActive !== false) {
            feature.defaultIsActive = true
        }
        feature.toggle = (active: boolean) => ({
            type: `${feature.id}_toggle`,
            payload: active,
        })
        const initialState: {[key: string]: string | boolean | undefined} = {
            active: feature.defaultIsActive,
        }

        const reducers: any = {
            [`${feature.id}_toggle`]: (state: any, action: any) => {
                notifySettingsUpdated()
                notifyToggle({type: 'toggle', featureId: feature.id, value: action.payload})
                return {...state, active: action.payload}
            },
        }

        feature.settings =
            feature.settings?.map((setting: Setting) => {
                initialState[setting.id] = setting.initValue
                setting.onSave = (payload: any = '') => ({
                    type: `${feature.id}_${setting.id}`,
                    payload,
                })

                reducers[`${feature.id}_${setting.id}`] = (state: any, action: any) => {
                    updateSetting(action.payload, feature.id, setting.id)
                    notifySettingsUpdated()
                    return {...state, [setting.id]: action.payload}
                }

                return setting
            }) || []

        feature.reducer = createReducer(initialState, reducers)
        return feature
    })
}

const notifySettingsUpdated = () => Browser.sendMessageToActiveTab('settings-updated')
const notifyToggle = (data: {type: 'toggle'; featureId: string; value: string}) => Browser.sendMessageToActiveTab(data)

const updateSetting = (value: string, featureId: string, settingId: string) =>
    Browser.sendMessageToActiveTab({value, featureId, settingId})
