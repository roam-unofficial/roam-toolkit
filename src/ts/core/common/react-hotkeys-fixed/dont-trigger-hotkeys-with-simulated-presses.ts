import {Handler, Key, KeyChord, KeySequence} from './hotkey'

/**
 * These keys should not trigger other handlers in the middle of an existing handler.
 * Allow the others to run concurrently though, so the UI feels more responsive.
 */
const KEYS_THAT_WE_ALSO_SIMULATE: Key[] = ['Escape']

const keyChordMightBeSimulated = (keyChord: KeyChord) =>
    KEYS_THAT_WE_ALSO_SIMULATE.some(key => keyChord.includes(key))

let executingHandler = 0

const preventWhileOtherHandlersAreExecuting = (handler: Handler): Handler => {
    return async (event: KeyboardEvent) => {
        if (executingHandler === 0) {
            await trackIfHandlerIsExecuting(handler)(event)
        }
    }
}

const trackIfHandlerIsExecuting = (handler: Handler): Handler => async (event: KeyboardEvent) => {
    executingHandler += 1
    try {
        await handler(event)
    } catch (error) {
        console.error(error)
    }
    executingHandler -= 1
}

/**
 * If we artificially simulate a key press, that keypress should not
 * trigger our own hotkeys.
 *
 * For example, simulating "Esc" to unfocus a block should not trigger
 * our own hotkey for "Esc".
 *
 * @return a decorated version of a handler that does nothing if other
 *         handlers are running
 */
export const dontTriggerWhenKeyPressIsSimulated = (keySequence: KeySequence, handler: Handler): Handler => {
    if (keyChordMightBeSimulated(keySequence)) {
        return preventWhileOtherHandlersAreExecuting(handler)
    } else {
        return trackIfHandlerIsExecuting(handler)
    }
}

