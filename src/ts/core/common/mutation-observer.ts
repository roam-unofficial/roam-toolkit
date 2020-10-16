import {assumeExists} from 'src/core/common/assert'

export type DisconnectFn = () => void

export const onSelectorChange = (
    selector: string,
    handleChange: (changedElement: HTMLElement) => void,
    observeChildren: boolean = false,
    observeAttributes: boolean = true
): DisconnectFn =>
    observeElement(
        assumeExists(document.querySelector(selector)) as HTMLElement,
        handleChange,
        observeChildren,
        observeAttributes
    )

const observeElement = (
    observeInside: HTMLElement,
    handleChange: (changedElement: HTMLElement) => void,
    observeChildren: boolean = false,
    observeAttributes: boolean = true
): DisconnectFn => {
    const waitForLoad = new MutationObserver(mutations => {
        handleChange(mutations[0].target as HTMLElement)
    })

    waitForLoad.observe(observeInside, {
        childList: true,
        attributes: observeAttributes,
        subtree: observeChildren,
    })

    return () => waitForLoad.disconnect()
}

/**
 * @return A promise of the element matching the selector
 */
export const waitForSelectorToExist = (
    selector: string,
    observeInside: HTMLElement = document.body
): Promise<HTMLElement> => {
    return new Promise(resolve => {
        const resolveIfElementExists = () => {
            const element = observeInside.querySelector(selector) as HTMLElement
            if (element) {
                resolve(element)
                return true
            }
            return false
        }

        resolveIfElementExists()

        const disconnect = observeElement(
            observeInside,
            () => {
                if (resolveIfElementExists()) {
                    disconnect()
                }
            },
            true
        )
    })
}
