import {Selectors} from '../roam/selectors'

export type ValueElement = HTMLTextAreaElement | HTMLInputElement | HTMLSelectElement

/**
 * @return The element being edited, or null if no element is being edited
 */
export function getActiveEditElement(): ValueElement | null {
    // stolen from Surfingkeys. Needs work.

    let element = document.activeElement
    // on some pages like chrome://history/, input is in shadowRoot of several other recursive shadowRoots.
    while (element?.shadowRoot) {
        if (element.shadowRoot.activeElement) {
            element = element.shadowRoot.activeElement
        } else {
            const subElement = element.shadowRoot.querySelector('input, textarea, select')
            if (subElement) {
                element = subElement
            }
            break
        }
    }

    // document.activeElement can be either `document.body` or `null`
    // https://developer.mozilla.org/en-US/docs/Web/API/DocumentOrShadowRoot/activeElement
    if (!element || !isEditElement(element)) {
        return null
    }

    return element as ValueElement
}

const isEditElement = (element: Element) =>
    element.tagName === 'INPUT' || element.tagName === 'TEXTAREA' || element.tagName === 'SELECT'

export function getTopLevelBlocks() {
    return document.querySelector('.roam-article div .flex-v-box') as HTMLElement
}

export function getLastTopLevelBlock() {
    const lastChild = getTopLevelBlocks().lastChild as HTMLElement
    return lastChild.querySelector(`${Selectors.block}, textarea`) as HTMLElement
}

export function getFirstTopLevelBlock() {
    const firstChild = getTopLevelBlocks().firstChild as HTMLElement
    return firstChild.querySelector(`${Selectors.block}, textarea`) as HTMLElement
}

export function getInputEvent() {
    return new Event('input', {
        bubbles: true,
    })
}

export const isElementVisible = (element: Element | null): boolean => {
    if (!element) {
        return false
    }
    const {x, y} = element.getBoundingClientRect()
    return x >= 0 && y >= 0 && x <= window.innerWidth && y <= window.innerHeight
}
