import {combineReducers} from 'redux'
import settings, {IAppSettings} from './settings/reducer'

import {Features} from '../../features/features'

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

const reducers = combineReducers<IAppState>({
    ...Features.all.map((f: any) => ({[f.id]: f.reducer})).reduce((r: any, c: any) => Object.assign(r, c), {}),
    settings,
})

export default reducers
