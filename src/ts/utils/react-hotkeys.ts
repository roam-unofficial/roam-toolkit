import {KEY_TO_CODE} from './keyboard'

const invertObject = <K, V>(obj: {
    // @ts-ignore
    [key: K]: V
}) => {
    const inverted = {}
    for (let [key, value] of Object.entries(obj)) {
        // Fallback to taking the first one, if multiple values conflict
        // @ts-ignore
        inverted[value] = inverted[value] || key
    }
    return inverted
}

/**
 * React Hotkeys treats j/J as different keys, which is buggy when detecting key Combinations.
 * For example, with this sequence:
 *
 * [shift down, j down, shift up, j up]
 *
 *
 *        ---------Shift+J-------
 *        |                     |
 * [Shift+J down, J down, Shift+J up, j up]
 *                   |                  |
 *                   ----Not Released----
 *
 * React Hotkeys thinks that the "J" key is still down, which breaks all hotkeys until you
 * Un-focus the browser window (resetting the key history).
 *
 * To workaround this issue, we normalize j/J to be the "same key" using the keycode,
 * That way, a "J" keydown is stored as a "j" keydown in the key history, so a "j" keyup
 * will "release" it.
 *
 * Related issue: https://github.com/greena13/react-hotkeys/issues/249
 *
 * React Hotkeys doesn't have an active maintainer, so it's harder to fix upstream.
 */
export const CODE_TO_KEY: {[key: string]: string} = invertObject(KEY_TO_CODE)

// prettier-ignore
export const KEY_TO_SHIFTED: {[key: string]: string} = {
    '0': ')',
    '1': '!',
    '2': '@',
    '3': '#',
    '4': '$',
    '5': '%',
    '6': '^',
    '7': '&',
    '8': '*',
    '9': '(',
    ';': ':',
    '=': '+',
    ',': '<',
    '-': '_',
    '.': '>',
    '/': '?',
    '[': '{',
    '\\': '|',
    ']': '}',
    "'": '"',
    'a': 'A',
    'b': 'B',
    'c': 'C',
    'd': 'D',
    'e': 'E',
    'f': 'F',
    'g': 'G',
    'h': 'H',
    'i': 'I',
    'j': 'J',
    'k': 'K',
    'l': 'L',
    'm': 'M',
    'n': 'N',
    'o': 'O',
    'p': 'P',
    'q': 'Q',
    'r': 'R',
    's': 'S',
    't': 'T',
    'u': 'U',
    'v': 'V',
    'w': 'W',
    'x': 'X',
    'y': 'Y',
    'z': 'Z',
}

// prettier-ignore
export const KEY_TO_UNSHIFTED: {[key: string]: string} = invertObject(KEY_TO_SHIFTED);

// Listen to both "shift+x" and "x", because the latter triggers if you hold down
// "shift+x"
export const normalizeKeyCombo = (keyCombo: string): string[] => {
    const keys = keyCombo.split('+')
    const key = keys.pop()
    const modifiers = keys.filter(key => key.toLowerCase())

    const unshifted = KEY_TO_UNSHIFTED[key!]
    if (unshifted) {
        const nonShiftModifiers = modifiers.filter(key => key !== 'shift')
        // Expand keys like "alt+D" => "alt+shift+d"
        // Normalize keys like "alt+shift+D => alt+shift+d"
        return [
            nonShiftModifiers.concat([key!]).join('+'),
            nonShiftModifiers.concat(['shift', key!]).join('+'),
        ]
    }

    // Otherwise, leave the key combinations alone
    return [keyCombo]
}
