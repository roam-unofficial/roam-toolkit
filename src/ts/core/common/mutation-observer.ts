import {assumeExists} from 'src/core/common/assert'

type DisconnectFn = () => void

export const onSelectorChange = (selector: string, handleChange: (changedElement: HTMLElement) => void): DisconnectFn =>
    observeElement(assumeExists(document.querySelector(selector)) as HTMLElement, handleChange)

const observeElement = (
    observeInside: HTMLElement,
    handleChange: (changedElement: HTMLElement) => void,
    observeChildren: boolean = false
): DisconnectFn => {
    const waitForLoad = new MutationObserver(mutations => {
        handleChange(mutations[0].target as HTMLElement)
    })

    waitForLoad.observe(observeInside, {
        childList: true,
        attributes: true,
        subtree: observeChildren,
    })

    return () => waitForLoad.disconnect()
}

export const waitForSelectorToExist = (selector: string, observeInside: HTMLElement = document.body) => {
    if (observeInside.querySelector(selector)) {
        return Promise.resolve()
    }

    return new Promise(resolve => {
        const disconnect = observeElement(
            observeInside,
            () => {
                if (observeInside.querySelector(selector)) {
                    disconnect()
                    resolve()
                }
            },
            true
        )
    })
}
