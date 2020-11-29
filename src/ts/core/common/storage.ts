// import {browser} from 'webextension-polyfill-ts'
import {IAppState} from '../../background/store'
// import {reducers} from 'src/core/features';

let runtimeState: any = undefined

export const getStateFromStorage = (): any => {
    // return (await browser.storage.local.get('appstate')).appstate
    console.log('retrieving', runtimeState)
    return runtimeState
}

export const saveStateToStorage = (state: IAppState) => {
    console.log('not saving', state)
    runtimeState = state
    // return browser.storage.local.set({appstate: state});
}

// (async () => {
//     const store: Store<IAppState> = createStore(reducers,  getStateFromStorage())
//     store.subscribe(() => saveStateToStorage(store.getState()))
//     store.dispatch({type: 'load_defaults_dummy'})
// wrapStore(store)
// })()

