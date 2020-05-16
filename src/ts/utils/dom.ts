export type ValueElement = HTMLTextAreaElement | HTMLInputElement | HTMLSelectElement

export function getActiveEditElement(): ValueElement {
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
    return element as ValueElement
}

export function getTitleElement() {
    return document.querySelector('.rm-title-display') as HTMLElement
}

export function getTopLevelBlocks() {
    return document.querySelector('.roam-article div .flex-v-box') as HTMLElement
}

export function getLastTopLevelBlock() {
    const lastChild = getTopLevelBlocks().lastChild as HTMLElement
    return lastChild.querySelector('.roam-block, textarea') as HTMLElement
}

export function getFirstTopLevelBlock() {
    const firstChild = getTopLevelBlocks().firstChild as HTMLElement
    return firstChild.querySelector('.roam-block, textarea') as HTMLElement
}

export function getInputEvent() {
    return new Event('input', {
        bubbles: true,
        cancelable: true,
    })
}
