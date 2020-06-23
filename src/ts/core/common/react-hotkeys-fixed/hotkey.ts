// @ts-ignore this internal import is needed to workaround a react-hotkeys issue
import KeyEventManager from 'react-hotkeys/es/lib/KeyEventManager'
import {allowHoldingShiftedKeys} from './allow-holding-shifted-keys'
import {dontTriggerWhenKeyPressIsSimulated} from './dont-trigger-hotkeys-with-simulated-presses'

/**
 * A "KeySequence" is a series of one or more KeyChords to press in succession, separated by space.
 * For example: 'g g' or just 'alt+D'
 */
export type KeySequence = string
/**
 * A "KeyChord" is a single combination of one or more keys, separated by '+'
 * For example: 'command+x' or just 'x'
 */
export type KeyChord = string
/**
 * A "Key" is a single physical key on a keyboard
 * For example: 'x'
 */
export type Key = string
/**
 * A "Handler" is function to run in response to a keypress.
 * It may return a promise to indicate that the function is asynchronous, and
 * takes time to finish.
 */
export type Handler = (event: KeyboardEvent) => Promise<any> | undefined


export class Hotkey {
    private keySequence: KeySequence
    private handler: Handler

    constructor(keySequence: KeySequence, handler: Handler) {
        this.keySequence = keySequence
        this.handler = handler
    }

    usesMultipleKeyChords() {
        return this.keySequence.includes(' ')
    }

    fixedKeySequence() {
        return allowHoldingShiftedKeys(this.keySequence)
    }

    fixedHandler() {
        let handler = this.handler
        if (this.usesMultipleKeyChords()) {
            handler = clearKeyPressesAfterFinishingKeySequence(handler)
        }
        return dontTriggerWhenKeyPressIsSimulated(this.keySequence, handler)
    }
}


/**
 * React hotkeys activates `g g` twice when pressing `g g g`,
 * because it listens to a "rolling window" of keyChords
 *
 * Clear the key history after each sequence using this workaround:
 * https://github.com/greena13/react-hotkeys/issues/255#issuecomment-558199060
 */
const clearKeyPressesAfterFinishingKeySequence = (handler: Handler): Handler => async event => {
    await handler(event)
    KeyEventManager.getInstance()._clearKeyHistory()
}
