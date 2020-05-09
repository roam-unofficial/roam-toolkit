import {createStore, Store} from 'redux'
import {wrapStore} from 'webext-redux'
import reducers, {IAppState} from './store'
import {getStateFromStorage, saveStateToStorage} from '../utils/storage'
;(async () => {
    const store: Store<IAppState> = createStore(reducers, await getStateFromStorage())
    store.subscribe(() => saveStateToStorage(store.getState()))
    store.dispatch({type: 'load_defaults_dummy'})
    wrapStore(store)
})()
