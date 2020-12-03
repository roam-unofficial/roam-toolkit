import {Reducer} from 'redux'
import {createReducer} from './redux'
import {getStateFromStorage} from '../common/storage'
import {Browser} from '../common/browser'

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
    warning?: string
    settings?: Setting[]
    toggleable?: boolean
    enabledByDefault?: boolean
    toggle?: (active: boolean) => void
    reducer?: Reducer
}

export interface Shortcut extends Setting {
    type: 'shortcut'
    onPress: (event: KeyboardEvent) => void
}

export const Settings = {
    get: async (featureId: string, settingId: string, defaultValue?: string) =>
        getStateFromStorage()?.[featureId]?.[settingId] || defaultValue,
    isActive: async (featureId: string, defaultValue: boolean = true) =>
        getStateFromStorage()?.[featureId]?.active || defaultValue,
}
const initDefaultState = (feature: Feature): {active: boolean} => {
    return {
        active: feature.enabledByDefault !== false,
    }
}

export const prepareSettings = (features: Feature[]): Feature[] => {
    return features.map((feature: Feature) => {
        if (feature.toggleable !== false) {
            feature.toggleable = true
        }
        feature.toggle = (active: boolean) => ({
            type: `${feature.id}_toggle`,
            payload: active,
        })

        const initialState: any = initDefaultState(feature)

        let reducers: any = {
            [`${feature.id}_toggle`]: (state: any, action: any) => {
                notifySettingsUpdated()
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

const updateSetting = (value: string, featureId: string, settingId: string) =>
    Browser.sendMessageToActiveTab({value, featureId, settingId})

