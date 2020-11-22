import {delay} from './async'

type Modifiers = {
    shiftKey?: boolean,
    metaKey?: boolean,
    ctrlKey?: boolean,
}

export const Mouse = {
    BASE_DELAY: 20,
    simulateClick(
        buttons: number,
        element: HTMLElement,
        modifiers: Modifiers = {},
        delayOverride: number = 0,
    ) {
        const mouseClickEvents = ['mousedown', 'click', 'mouseup']
        mouseClickEvents.forEach(mouseEventType => {
            element.dispatchEvent(getMouseEvent(mouseEventType, buttons, modifiers))
        })
        return delay(delayOverride || this.BASE_DELAY)
    },
    hover(element: HTMLElement, delayOverride: number = 0) {
        element.dispatchEvent(getMouseEvent('mouseover', 1))
        element.dispatchEvent(getMouseEvent('mousemove', 1))
        return delay(delayOverride || this.BASE_DELAY)
    },
    leftClick(
        element: HTMLElement,
        modifiers: Modifiers = {},
        additionalDelay: number = 0,
    ) {
        return this.simulateClick(1, element, modifiers, additionalDelay)
    },
}

const getMouseEvent = (
    mouseEventType: string,
    buttons: number,
    modifiers: Modifiers = {},
) =>
    new MouseEvent(mouseEventType, {
        shiftKey: modifiers.shiftKey || false,
        metaKey: modifiers.metaKey || false,
        ctrlKey: modifiers.ctrlKey || false,
        view: window,
        bubbles: true,
        cancelable: true,
        buttons,
    })
