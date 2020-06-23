// @ts-ignore this internal import is needed to workaround a react-hotkeys issue
import KeyEventManager from 'react-hotkeys/es/lib/KeyEventManager'

import {Handler} from 'src/core/react-hotkeys/key-handler'
import {KeySequence} from 'src/core/react-hotkeys/key-sequence'

/**
 * React hotkeys activates `g g` twice when pressing `g g g`,
 * because it listens to a "rolling window" of keyChords
 *
 * Clear the key history after each sequence using this workaround:
 * https://github.com/greena13/react-hotkeys/issues/255#issuecomment-558199060
 */
export const clearKeyPressesAfterFinishingKeySequence = (keySequence: KeySequence, handler: Handler): Handler => {
    if (keySequence.usesMultipleKeyChords()) {
        return async event => {
            await handler(event)
            console.warn(`Clearing react-hotkeys history after sequence ${keySequence.toString()}`);
            KeyEventManager.getInstance()._clearKeyHistory()
        }
    }
    return handler
}