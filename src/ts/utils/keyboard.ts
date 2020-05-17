import {delay} from './async'

export const Keyboard = {
    // Todo come up with a way to autogenerate the methods from the interface and the code
    LEFT_ARROW: 37,
    UP_ARROW: 38,
    RIGHT_ARROW: 39,
    DOWN_ARROW: 40,
    BASE_DELAY: 20,

    async simulateKey(code: number, delayOverride: number = 0, opts?: KeyboardEventInit) {
        ['keydown', 'keyup'].forEach(eventType =>
            document?.activeElement?.dispatchEvent(getKeyboardEvent(eventType, code, opts))
        )
        return delay(delayOverride || this.BASE_DELAY)
    },
    async pressEnter(delayOverride: number = 0) {
        return this.simulateKey(13, delayOverride)
    },
    async pressEsc(delayOverride: number = 0) {
        return this.simulateKey(27, delayOverride)
    },
    async pressBackspace(delayOverride: number = 0) {
        return this.simulateKey(8, delayOverride)
    },
    async pressTab(delayOverride: number = 0) {
        return this.simulateKey(9, delayOverride)
    },
    async pressShiftTab(delayOverride: number = 0) {
        return this.simulateKey(9, delayOverride, {shiftKey: true})
    },
}

const getKeyboardEvent = (type: string, code: number, opts: any) =>
    new KeyboardEvent(type, {
        bubbles: true,
        cancelable: true,
        // @ts-ignore
        keyCode: code,
        ...opts,
    })
