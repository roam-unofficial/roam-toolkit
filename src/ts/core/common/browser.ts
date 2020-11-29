// import {browser} from 'webextension-polyfill-ts'

// Breaks out of the content script context by injecting a specially
// constructed script tag and injecting it into the page.
export const runInPageContext = (method: (...args: any[]) => any, ...args: any[]) => {
    // will be parsed as a function object.
    const stringifiedMethod = method.toString()

    const stringifiedArgs = JSON.stringify(args)

    const scriptContent = `
    document.currentScript.innerHTML = JSON.stringify((${stringifiedMethod})(...${stringifiedArgs}));
  `

    const scriptElement = document.createElement('script')
    scriptElement.innerHTML = scriptContent
    document.documentElement.prepend(scriptElement)

    const result = JSON.parse(scriptElement.innerHTML)
    document.documentElement.removeChild(scriptElement)
    console.log(result)
    return result
}

export const Browser = {
    goToPage: (url: string) => (window.location.href = url),

    getActiveTabUrl: () => new URL(window.location.href),

    // Does not work from content script
    // getActiveTab: () => browser.tabs.query({currentWindow: true, active: true}).then(tabs => tabs[0]),

    sendMessageToActiveTab(message: any) {
        console.log('not sending a message', message)
        // return this.getActiveTab().then(tab => browser.tabs.sendMessage(tab.id!, message))
    },

    addMessageListener(callback: (message: any) => Promise<void> | undefined) {
        console.log('not adding a callback', callback)
        // browser.runtime.onMessage.addListener(callback)
    },
}
