import {browser} from 'webextension-polyfill-ts';

export const sendMessageToActiveTab = (message: any) =>
    browser.tabs.query({currentWindow: true, active: true})
        .then((tabs: any) => {
            for (const tab of tabs) {
                browser.tabs.sendMessage(tab.id, message);
            }
        })

// Breaks out of the content script context by injecting a specially
// constructed script tag and injecting it into the page.
export const runInPageContext = (method: Function, ...args: any[]) => {
    // will be parsed as a function object.
    const stringifiedMethod = method.toString();

    const stringifiedArgs = JSON.stringify(args);

    const scriptContent = `
    document.currentScript.innerHTML = JSON.stringify((${stringifiedMethod})(...${stringifiedArgs}));
  `;

    const scriptElement = document.createElement('script');
    scriptElement.innerHTML = scriptContent;
    document.documentElement.prepend(scriptElement);

    const result = JSON.parse(scriptElement.innerHTML);
    document.documentElement.removeChild(scriptElement)
    console.log(result)
    return result;
};
