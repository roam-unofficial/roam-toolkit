import {assumeExists} from './assert'

type DisconnectFn = () => void

export const onSelectorChange = (
    selector: string,
    handleChange: () => void,
    observeChildren: boolean = false,
    observeInside?: HTMLElement,
): DisconnectFn => {
    const waitForLoad = new MutationObserver(() => {
        handleChange()
    })

    waitForLoad.observe(observeInside ||assumeExists(document.querySelector(selector)), {
        childList: true,
        attributes: true,
        subtree: observeChildren,
    })

    return () => waitForLoad.disconnect()
}

export const waitForSelectorToExist = (selector: string, observeInside = document.body) => {
    if (observeInside.querySelector(selector)) {
        console.log('ALREADY')
        return Promise.resolve()
    }

    return new Promise(resolve => {
        const disconnect = onSelectorChange(
            selector,
            () => {
                if (document.querySelector(selector)) {
                    disconnect()
                    resolve()
                }
            },
            true,
            observeInside,
        )
    })
}
