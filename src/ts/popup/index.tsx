import * as React from 'react'
import ReactDOM from 'react-dom'
import {Provider} from 'react-redux'
// import {Store} from 'webext-redux'
import PopupApp from './containers/PopupApp'
import {createStore, Store} from 'redux';
import {IAppState} from 'src/background/store';
import {reducers} from 'src/core/features';

// const store = new Store()
const store: Store<IAppState> = createStore(reducers, {})


// store.ready().then(() => {
ReactDOM.render(
    <Provider store={store}>
        <PopupApp/>
    </Provider>,
    document.getElementById('popup-root')
)
// })
