// A "KeySequence" is a series of key chords, such as "g g" or "control+w j"
import {KEY_TO_UNSHIFTED} from 'src/core/common/keycodes'

import {KeyChord, KeySequence} from './hotkey'


/**
 * @return a list means the keychord was expanded into it's initial press and held variations.
 *         The list contains multiple alternatives trigger the same handler.
 *         See https://github.com/greena13/react-hotkeys#alternative-hotkeys
 */
export const allowHoldingShiftedKeys = (keySequence: KeySequence): KeyChord[] | KeySequence => {
    // Space means the sequence requires multiple successive key chords
    if (keySequence.includes(' ')) {
        const keyChords = keySequence.split(' ')
        return keyChords.map(convertUppercaseToLowercasePlusShift).join(' ')
    }

    /**
     * Pressing down "shift+j" triggers "shift+j", but _holding_ it down triggers _just_ "J".
     *
     * Binding just "J" should trigger the action in both cases.
     */
    return [keySequence, convertUppercaseToLowercasePlusShift(keySequence)]
}

/**
 * Converts a shifted character to it's non-shifted character, plus the shift key
 *
 * Examples:
 * - D => shift+d
 * - alt+D => alt+shift+d
 * - d => d
 */
const convertUppercaseToLowercasePlusShift = (keyChord: KeyChord): KeyChord => {
    const keys = keyChord.split('+')
    const key = keys.pop()
    const modifiers = keys.filter(key => key.toLowerCase())

    if (KEY_TO_UNSHIFTED[key!]) {
        const nonShiftModifiers = modifiers.filter(key => key !== 'shift')
        return nonShiftModifiers.concat(['shift', key!]).join('+')
    }

    return keyChord
}
