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

// 2nd column represents shifted keys
// prettier-ignore
export const KEY_TO_CODE: { [key: string]: number } = {
    'ArrowLeft': 37,
    'ArrowUp': 38,
    'ArrowRight': 39,
    'ArrowDown': 40,
    '0': 48, ')': 48,
    '1': 49, '!': 49,
    '2': 50, '@': 50,
    '3': 51, '#': 51,
    '4': 52, '$': 52,
    '5': 53, '%': 53,
    '6': 54, '^': 54,
    '7': 55, '&': 55,
    '8': 56, '*': 56,
    '9': 57, '(': 57,
    ';': 59, ':': 58,
    '=': 187, '+': 187,
    ',': 188, '<': 188,
    '-': 189, '_': 189,
    '.': 190, '>': 190,
    '/': 191, '?': 191,
    '[': 219, '{': 219,
    '\\': 220, '|': 220,
    ']': 221, '}': 221,
    '\'': 222, '"': 222,
    'a': 65, 'A': 65,
    'b': 66, 'B': 66,
    'c': 67, 'C': 67,
    'd': 68, 'D': 68,
    'e': 69, 'E': 69,
    'f': 70, 'F': 70,
    'g': 71, 'G': 71,
    'h': 72, 'H': 72,
    'i': 73, 'I': 73,
    'j': 74, 'J': 74,
    'k': 75, 'K': 75,
    'l': 76, 'L': 76,
    'm': 77, 'M': 77,
    'n': 78, 'N': 78,
    'o': 79, 'O': 79,
    'p': 80, 'P': 80,
    'q': 81, 'Q': 81,
    'r': 82, 'R': 82,
    's': 83, 'S': 83,
    't': 84, 'T': 84,
    'u': 85, 'U': 85,
    'v': 86, 'V': 86,
    'w': 87, 'W': 87,
    'x': 88, 'X': 88,
    'y': 89, 'Y': 89,
    'z': 90, 'Z': 90,
}
