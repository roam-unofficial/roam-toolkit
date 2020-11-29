import {IAppSettings} from './settings/reducer'

import 'redux'
// Enhance the Action interface with the option of a payload.
// While still importing the Action interface from redux.
declare module 'redux' {
    export interface Action<T = any, P = any> {
        type: T
        payload?: P
    }
}

export interface IAppState {
    settings: IAppSettings
}


