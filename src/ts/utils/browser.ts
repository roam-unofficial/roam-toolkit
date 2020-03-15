import {browser} from 'webextension-polyfill-ts';

export const sendMessageToActiveTab = (message: any) =>
    browser.tabs.query({currentWindow: true, active: true})
        .then((tabs: any) => {
            for (const tab of tabs) {
                browser.tabs.sendMessage(tab.id, message);
            }
        })
