import {createStore} from 'redux';
import {wrapStore} from 'webext-redux';
import {configureApp} from './AppConfig';
import reducers, {loadState} from './store';
import {browser} from 'webextension-polyfill-ts';
import { createDemo } from '../contentScripts/create-block-demo';

const preloadedState = loadState();
const store = createStore(reducers, preloadedState);

configureApp(store);
wrapStore(store);

browser.commands.onCommand.addListener((command) => {
    /* This is a hack to support keyboard shortcuts for frontend script. */
    console.log('received in background');

    browser.tabs.query({
        currentWindow: true,
        active: true
    }).then((tabs) =>
        tabs.forEach((tab) => browser.tabs.sendMessage(tab?.id!, command)));
});


// chrome.runtime.onMessage.addListener((command,sender,res) => {
//     // createDemo()
//     // res('received message')
//     res(command)
// });

browser.runtime.onMessage.addListener((command) => {
    // createDemo()
    browser.tabs.query({
        currentWindow: true,
        active: true
    }).then((tabs) =>
        tabs.forEach((tab) => browser.tabs.sendMessage(tab?.id!, command)));
    return Promise.resolve('received message2' + command)
});
