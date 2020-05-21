import {Features} from './features'
import {configure, GlobalHotKeys} from 'react-hotkeys'
import React from 'react'
import ReactDOM from 'react-dom'
import {nativeKeyBindingsToIgnore} from './block-navigation-mode'

configure({
    ignoreTags: [],
    ignoreRepeatedEventsWhenKeyHeldDown: false,
    // https://github.com/greena13/react-hotkeys/issues/249
    // Plain key bindings like `u` shouldn't clobber shortcuts like `cmd+u`
    stopEventPropagationAfterHandling: false,
    stopEventPropagationAfterIgnoring: false,
})

const shortcutContainer = document.createElement('div')


export type Handlers = {
    [action: string]: (event: KeyboardEvent) => void
}


export async function updateShortcuts() {
    const keyMap = await Features.getCurrentKeyMap()
    const handlers = Features.getShortcutHandlers()

    const shortcutElement = (
        <GlobalHotKeys
            keyMap={{
                IGNORE: nativeKeyBindingsToIgnore,
                ...keyMap,
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
