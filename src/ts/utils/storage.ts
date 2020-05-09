import {browser} from 'webextension-polyfill-ts'
import {IAppState} from '../background/store/index'

export const getStateFromStorage = async () => {
    return (await browser.storage.local.get('appstate')).appstate
}

export const saveStateToStorage = async (state: IAppState) => browser.storage.local.set({appstate: state})
