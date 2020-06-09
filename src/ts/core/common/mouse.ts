import {delay} from './async'

export const Mouse = {
    BASE_DELAY: 20,
    simulateClick(buttons: number, element: HTMLElement, shiftKey: boolean = false, delayOverride: number = 0) {
        const mouseClickEvents = ['mousedown', 'click', 'mouseup']
        mouseClickEvents.forEach(mouseEventType => {
            element.dispatchEvent(getMouseEvent(mouseEventType, buttons, shiftKey))
        })
        return delay(delayOverride || this.BASE_DELAY)
    },
    hover(element: HTMLElement, delayOverride: number = 0) {
        const mouseClickEvents = ['mouseover']
        mouseClickEvents.forEach(mouseEventType => {
            element.dispatchEvent(getMouseEvent(mouseEventType, 1))
        })
        return delay(delayOverride || this.BASE_DELAY)
    },
    leftClick(element: HTMLElement, shiftKey: boolean = false, additionalDelay: number = 0) {
        return this.simulateClick(1, element, shiftKey, additionalDelay)
    },
}

const getMouseEvent = (mouseEventType: string, buttons: number, shiftKey: boolean = false) =>
    new MouseEvent(mouseEventType, {
        shiftKey,
        view: window,
        bubbles: true,
        cancelable: true,
        buttons,
    })
