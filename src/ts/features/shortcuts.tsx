import {Features} from './features'
import {configure, GlobalHotKeys, KeyMap} from 'react-hotkeys'
import React from 'react'
import ReactDOM from 'react-dom'
import {nativeKeyBindingsToIgnore} from './block-navigation-mode'
import {CODE_TO_KEY, normalizeKeyCombo} from '../utils/react-hotkeys'

configure({
    ignoreTags: [],
    ignoreRepeatedEventsWhenKeyHeldDown: false,
    simulateMissingKeyPressEvents: true,
    // https://github.com/greena13/react-hotkeys/issues/249
    // Plain key bindings like `u` shouldn't clobber shortcuts like `cmd+u`
    stopEventPropagationAfterHandling: false,
    stopEventPropagationAfterIgnoring: false,
    customKeyCodes: CODE_TO_KEY,
})

const shortcutContainer = document.createElement('div')


export type Handlers = {
    [action: string]: (event: KeyboardEvent) => void
}


export async function updateShortcuts() {
    const keyMap = await Features.getCurrentKeyMap()
    const handlers = Features.getShortcutHandlers()

    const normalizedKeyMap: KeyMap = {}
    Object.entries(keyMap).forEach(
        ([action, keyCombo]) => (normalizedKeyMap[action] = normalizeKeyCombo(keyCombo as string))
    )

    const shortcutElement = (
        <GlobalHotKeys
            keyMap={{
                IGNORE: nativeKeyBindingsToIgnore,
                ...normalizedKeyMap,
            }}
            handlers={{
                IGNORE: () => {},
                ...handlers,
            }}
            allowChanges={true}
        />
    )
    // TODO: hitting this
    // https://github.com/DefinitelyTyped/DefinitelyTyped/issues/31734 was not able to resolve it
    // @ts-ignore
    ReactDOM.render(shortcutElement, shortcutContainer)
    // todo removing shortcut does not work?
}

updateShortcuts()
