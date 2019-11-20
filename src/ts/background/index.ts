import { createStore } from 'redux';
import { wrapStore } from 'webext-redux';
import { configureApp } from './AppConfig';
import reducers, { loadState } from './store';

const preloadedState = loadState();
const store = createStore(reducers, preloadedState);

configureApp(store);
wrapStore(store);
