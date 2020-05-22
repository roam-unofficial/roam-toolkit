import {Features} from './features'
import {configure, GlobalHotKeys, KeyMap} from 'react-hotkeys'
// @ts-ignore
import KeyEventManager from 'react-hotkeys/es/lib/KeyEventManager'
import React from 'react'
import ReactDOM from 'react-dom'
import {keysOverlappingWithNativeShortCuts, nativeKeyBindingsToIgnore} from './block-navigation-mode'
import {CODE_TO_KEY, normalizeKeySequence} from '../utils/react-hotkeys'

configure({
    ignoreTags: [],
    ignoreRepeatedEventsWhenKeyHeldDown: false,
    // This emits ctrl+u when holding down ctrl and pressing u,
    // otherwise only u is emitted
    simulateMissingKeyPressEvents: true,
    // https://github.com/greena13/react-hotkeys/issues/249
    // Plain key bindings like `u` shouldn't clobber shortcuts like `cmd+u`
    stopEventPropagationAfterHandling: false,
    stopEventPropagationAfterIgnoring: false,
    customKeyCodes: CODE_TO_KEY,
})

const shortcutContainer = document.createElement('div')

type Handler = (event: KeyboardEvent) => Promise<any> | undefined
export type Handlers = {
    [action: string]: Handler
}

let executingHandler = 0

// Roam actions such as unfocusing a block require simulating key presses.
// We only want want that simulated "Esc" press to do it's native job, not
// trigger another hotkey handler
const onlyOneHandlerAtATime = (handler: Handler, allowConcurrent: boolean = true): Handler => async (
    event: KeyboardEvent
) => {
    if (allowConcurrent || executingHandler === 0) {
        executingHandler += 1
        try {
            await handler(event)
        } catch (error) {
            console.error(error)
        }
        executingHandler -= 1
    }
}

export async function updateShortcuts() {
    const keyMap = await Features.getCurrentKeyMap()
    const handlers = Features.getShortcutHandlers()

    /**
     * For some reason, key sequences like 'g g' mess up the other shortcuts
     * See https://github.com/greena13/react-hotkeys/issues/229
     * And https://github.com/greena13/react-hotkeys/issues/219
     *
     * Workaround by separating sequences and single chords into different components:
     * https://github.com/greena13/react-hotkeys/issues/219#issuecomment-540680435
     */
    const singleKeyMap: KeyMap = {}
    const singleHandlers: Handlers = {}
    const sequenceKeyMap: KeyMap = {}
    const sequenceHandlers: Handlers = {}
    Object.entries(keyMap).forEach(([action, keySequence]) => {
        keySequence = keySequence as string
        const dontHandleDuringOtherHandlers = keysOverlappingWithNativeShortCuts.some(key =>
            (keySequence as string).includes(key)
        )
        if (keySequence.includes(' ')) {
            sequenceKeyMap[action] = normalizeKeySequence(keySequence)
            sequenceHandlers[action] = onlyOneHandlerAtATime(async event => {
                await handlers[action](event)
                // React hotkeys activates `g g` twice when pressing `g g g`,
                // because it listens to a "rolling window" of keyChords
                //
                // Clear the key history after each sequence using this workaround:
                // https://github.com/greena13/react-hotkeys/issues/255#issuecomment-558199060
                KeyEventManager.getInstance()._clearKeyHistory()
            }, dontHandleDuringOtherHandlers)
        } else {
            singleKeyMap[action] = normalizeKeySequence(keySequence)
            singleHandlers[action] = onlyOneHandlerAtATime(handlers[action], dontHandleDuringOtherHandlers)
        }
    })

    const shortcutElement = (
        <>
            <GlobalHotKeys
                keyMap={{
                    IGNORE: nativeKeyBindingsToIgnore,
                    ...singleKeyMap,
                }}
                handlers={{
                    IGNORE: () => {},
                    ...singleHandlers,
                }}
            />
            <GlobalHotKeys
                keyMap={{
                    IGNORE: nativeKeyBindingsToIgnore,
                    ...sequenceKeyMap,
                }}
                handlers={{
                    IGNORE: () => {},
                    ...sequenceHandlers,
                }}
            />
        </>
    )
    // TODO: hitting this
    // https://github.com/DefinitelyTyped/DefinitelyTyped/issues/31734 was not able to resolve it
    // @ts-ignore
    ReactDOM.render(shortcutElement, shortcutContainer)
    // todo removing shortcut does not work?
}

updateShortcuts()
