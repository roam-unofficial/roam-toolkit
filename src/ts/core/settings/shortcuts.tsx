import React from 'react'
import ReactDOM from 'react-dom'

import {ReactHotkeys} from 'src/core/react-hotkeys'
import {Features} from 'src/core/features'

const shortcutContainer = document.createElement('div')

export async function updateShortcuts() {
    const shortcutElement = (
        <ReactHotkeys
            keyMap={await Features.getCurrentKeyMap()}
            handlers={Features.getShortcutHandlers()}
        />
    )
    // TODO: hitting this
    // https://github.com/DefinitelyTyped/DefinitelyTyped/issues/31734 was not able to resolve it
    // @ts-ignore
    ReactDOM.render(shortcutElement, shortcutContainer)
    // todo removing shortcut does not work?
}

updateShortcuts()
