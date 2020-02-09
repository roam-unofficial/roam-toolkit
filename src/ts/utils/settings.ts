import { browser } from 'webextension-polyfill-ts';
import { Reducer } from 'redux';
import { createReducer } from './redux'
import { getStateFromStorage } from './storage'


export interface Textarea {
    type: 'textarea',
    id: string,
    label?: string,
    initValue?: string,
    description?: string,
    onSave?: (value: string) => void,
}

export type Setting = Textarea

export type Feature = {
    id: string,
    name: string,
    description?: string,
    shortcuts?: Shortcut[],
    settings?: Setting[],
    toggleable?: boolean,
    toggle?: (active: boolean) => void,
    reducer?: Reducer
}

export interface Shortcut {
    id: string,
    label: string,
    initValue: string,
    placeholder?: string,
    description?: string,
    onPress: () => void,
    onSave?: (shortcut: string) => void
}



export const getSetting = async (featureId: string, settingId: string) => {
    return (await getStateFromStorage())[featureId][settingId]
}

export const isActive = async (featureId: string) => {
    return (await getStateFromStorage())[featureId].active
}

export const prepareSettings = (features: any) => {
    return features.map((feature: any) => {

        if (feature.toggleable !== false) {
            feature.toggleable = true;
        }
        feature.toggle = (active: boolean) => ({ type: `${feature.id}_toggle`, payload: active })

        const initialState: any = {
            active: false
        }

        let reducers = {
            [`${feature.id}_toggle`]: (state: any, action: any) =>
                ({ ...state, active: action.payload })
        }

        feature.shortcuts = feature.shortcuts ? feature.shortcuts.map((shortcut: Shortcut) => {
            initialState[shortcut.id] = shortcut.initValue
            shortcut.onSave = (payload: any = '') =>
                ({ type: `${feature.id}_set_${shortcut.id}_shortcut`, payload })
            reducers = {
                ...reducers,
                [`${feature.id}_set_${shortcut.id}_shortcut`]: (state: any, action: any) => {
                    const newShortcut = action.payload;
                    if (state[shortcut.id] !== newShortcut && newShortcut !== '') {
                        updateShortcut(newShortcut, feature.id, shortcut.id);
                    }
                    return { ...state, [shortcut.id]: newShortcut }
                }
            }
            return shortcut
        }) : []

        feature.settings = feature.settings ? feature.settings.map((setting: Setting) => {
            initialState[setting.id] = setting.initValue
            setting.onSave = (payload: any = '') => ({ type: `${feature.id}_${setting.id}`, payload })
            reducers = {
                ...reducers,
                [`${feature.id}_${setting.id}`]: (state: any, action: any) => {
                    updateSetting(action.payload, feature.id, setting.id);
                    return { ...state, [setting.id]: action.payload }
                }
            }
            return setting
        }) : []

        feature.reducer = createReducer(initialState, reducers)
        return feature
    });
}

const updateShortcut = (shortcut: string, featureId: string, shortcutId: string) => {
    browser.tabs.query({ currentWindow: true, active: true }).then((tabs: any) => {
        for (const tab of tabs) {
            browser.tabs.sendMessage(tab.id, { shortcut, featureId, shortcutId });
        }
    })
}

const updateSetting = (value: string, featureId: string, settingId: string) => {
    browser.tabs.query({ currentWindow: true, active: true }).then((tabs: any) => {
        for (const tab of tabs) {
            browser.tabs.sendMessage(tab.id, { value, featureId, settingId });
        }
    })
}