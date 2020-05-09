import {browser} from 'webextension-polyfill-ts'

// Breaks out of the content script context by injecting a specially
// constructed script tag and injecting it into the page.
export const runInPageContext = (method: Function, ...args: any[]) => {
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

    getActiveTabUrl: () => window.location.href,

    // Does not work from content script
    getActiveTab: () => browser.tabs.query({currentWindow: true, active: true}).then(tabs => tabs[0]),

    sendMessageToActiveTab(message: any) {
        return this.getActiveTab().then(tab => browser.tabs.sendMessage(tab.id!, message))
    },
}
