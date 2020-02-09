import { browser } from 'webextension-polyfill-ts';
import { createReducer } from './redux'
import { getStateFromStorage } from './storage'

export interface Activation {
    type: 'activation',
    id: string,
    label: string,
    onSave: (toggle: boolean) => void
}

export interface Shortcut {
    type: 'shortcut',
    id: string,
    label: string,
    initValue: string,
    placeholder?: string,
    description?: string,
    onPress: () => void,
    onSave?: (shortcut: string) => void,
}

export interface Textarea {
    type: 'textarea',
    id: string,
    label?: string,
    initValue?: string,
    description?: string,
    onSave?: (value: string) => void,
}

export type Setting = Shortcut | Activation | Textarea

export type Feature = {
    id: string,
    name: string,
    description?: string,
    settings: Setting[]
}



export const getSetting = async (featureId: string, settingId: string) => {
    return (await getStateFromStorage())[featureId][settingId]
}

export const isActive = async (featureId: string) => {
    return (await getStateFromStorage())[featureId][`${featureId}_active`]
}

export const prepareSettings = (features: any) => {
    return features.map((feature: any) => {

        const initialState = {
            [`${feature.id}_active`]: false
        }

        let settings: Setting[] = [{
            type: 'activation', id: `${feature.id}_active`, label: 'Activate',
            onSave: (payload = false) => ({ type: `${feature.id}_toggle_active_action`, payload })
        }]

        let toReduce = {
            [`${feature.id}_toggle_active_action`]: (state: any, action: any) =>
                ({ ...state, [`${feature.id}_active`]: action.payload })
        }

        feature.settings.map((setting: any) => {
            initialState[setting.id] = setting.initValue
            if (setting.type === 'shortcut') {
                setting.onSave = (payload: any = '') =>
                    ({ type: `${feature.id}_set_${setting.id}_shortcut_action`, payload })
                toReduce = {
                    ...toReduce,
                    [`${feature.id}_set_${setting.id}_shortcut_action`]: (state: any, action: any) => {
                        const newShortcut = action.payload;
                        if (state[setting.id] !== newShortcut) {
                            browser.tabs.query({ currentWindow: true, active: true }).then((tabs: any) => {
                                for (const tab of tabs) {
                                    browser.tabs.sendMessage(tab.id, {
                                        shortcut: newShortcut, featureId: feature.id, settingId: setting.id
                                    });
                                }
                            })
                        }
                        return { ...state, [setting.id]: newShortcut }
                    }
                }
            } else {
                setting.onSave = (payload: any = '') =>
                    ({ type: `${feature.id}_set_${setting.id}_action`, payload })
                toReduce = {
                    ...toReduce,
                    [`${feature.id}_set_${setting.id}_action`]: (state: any, action: any) => {
                        return { ...state, [setting.id]: action.payload }
                    }
                }
            }
            settings = [...settings, setting]
        })

        feature.settings = settings
        feature.reducer = createReducer(initialState, toReduce)
        return feature
    });
}