import * as React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { Store } from 'webext-redux';
import PopupApp from './containers/PopupApp';

const store = new Store();

store.ready().then(() => {
	ReactDOM.render(
		<Provider store={store}>
			<PopupApp />
		</Provider>
		, document.getElementById('popup-root'));
});
