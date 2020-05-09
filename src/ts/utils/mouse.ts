import {delay} from './async'

export const Mouse = {
    BASE_DELAY: 20,
    simulateClick(buttons: number, element: HTMLElement, delayOverride: number = 0) {
        const mouseClickEvents = ['mousedown', 'click', 'mouseup']
        mouseClickEvents.forEach(mouseEventType => {
            element.dispatchEvent(getMouseEvent(mouseEventType, buttons))
        })
        return delay(delayOverride || this.BASE_DELAY)
    },
    leftClick(element: HTMLElement, additionalDelay: number = 0) {
        return this.simulateClick(1, element, additionalDelay)
    },
}

const getMouseEvent = (mouseEventType: string, buttons: number) =>
    new MouseEvent(mouseEventType, {
        view: window,
        bubbles: true,
        cancelable: true,
        buttons,
    })
