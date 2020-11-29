import * as React from 'react'
import ReactDOM from 'react-dom'
import {Provider} from 'react-redux'
// import {Store} from 'webext-redux'
import OptionsApp from './containers/OptionsApp'
import {IAppState} from 'src/background/store';
import {createStore, Store} from 'redux';
import {reducers} from 'src/core/features';
// import {getStateFromStorage} from 'src/core/common/storage';

// const store = new Store()
const store: Store<IAppState> = createStore(reducers, {})


// store.ready().then(() => {
ReactDOM.render(
    <Provider store={store}>
        <OptionsApp/>
    </Provider>,
    document.getElementById('options-root')
)
// })
