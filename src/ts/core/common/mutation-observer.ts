import {assumeExists} from 'src/core/common/assert'

type DisconnectFn = () => void

export const onSelectorChange = (selector: string, handleChange: () => void): DisconnectFn =>
    observeElement(assumeExists(document.querySelector(selector)) as HTMLElement, handleChange)

const observeElement = (
    observeInside: HTMLElement,
    handleChange: () => void,
    observeChildren: boolean = false
): DisconnectFn => {
    const waitForLoad = new MutationObserver(() => {
        handleChange()
    })

    waitForLoad.observe(observeInside, {
        childList: true,
        attributes: true,
        subtree: observeChildren,
    })

    return () => waitForLoad.disconnect()
}

export const waitForSelectorToExist = (selector: string) => {
    if (document.body.querySelector(selector)) {
        return Promise.resolve()
    }

    return new Promise(resolve => {
        const disconnect = observeElement(
            document.body,
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
