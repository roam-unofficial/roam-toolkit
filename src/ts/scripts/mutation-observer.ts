import {assumeExists} from '../utils/assert'

type DisconnectFn = () => void

export const onSelectorChange = (
    selector: string,
    handleChange: () => void,
    observeChildren: boolean = false,
): DisconnectFn => {
    const waitForLoad = new MutationObserver(() => {
        handleChange()
    })

    waitForLoad.observe(assumeExists(document.querySelector(selector)), {
        childList: true,
        attributes: true,
        subtree: observeChildren,
    })

    return () => waitForLoad.disconnect()
}

export const waitForSelectorToExist = (selector: string) => {
    if (document.querySelector(selector)) {
        return Promise.resolve()
    }

    return new Promise(resolve => {
        const disconnect = onSelectorChange(
            'body',
            () => {
                if (document.querySelector(selector)) {
                    disconnect()
                    resolve()
                }
            },
            true
        )
    })
}
