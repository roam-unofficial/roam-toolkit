// @ts-ignore this internal import is needed to workaround a react-hotkeys issue
import {KeySequence} from './key-sequence'

/**
 * A "Handler" is function to run in response to a keypress.
 * It may return a promise to indicate that the function is asynchronous, and
 * takes time to finish.
 */
export type Handler = (event: KeyboardEvent) => Promise<any> | undefined

let executingHandler = 0

const blockConcurrentHandling = (handler: Handler): Handler => {
    return async (event: KeyboardEvent) => {
        if (executingHandler === 0) {
            await trackWhetherExecuting(handler)(event)
        }
    }
}

const trackWhetherExecuting = (handler: Handler): Handler => async (event: KeyboardEvent) => {
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
 * To do this, we keep track when handlers execute, and refuse to do anything
 * if a simulated handler runs in the middle of another handler.
 *
 * See test case for examples.
 *
 * @return a decorated version of a handler that does nothing if other
 *         handlers are running
 */
export const blockConcurrentHandlingOfSimulatedKeys = (keySequence: KeySequence, handler: Handler): Handler => {
    if (keySequence.mightBeSimulated()) {
        return blockConcurrentHandling(handler)
    } else {
        return trackWhetherExecuting(handler)
    }
}
