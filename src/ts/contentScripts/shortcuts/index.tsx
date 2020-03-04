import {Features} from '../features'
import {configure, GlobalHotKeys} from 'react-hotkeys';
import React from 'react';
import ReactDOM from 'react-dom';

configure({
    ignoreTags: [],
})

export async function updateShortcuts() {
    const shortcutElement = <GlobalHotKeys keyMap={await Features.getCurrentKeyMap()}
                                           handlers={Features.getShortcutHandlers()}
                                           allowChanges={true}/>;
    // TODO: hitting this
    // https://github.com/DefinitelyTyped/DefinitelyTyped/issues/31734 was not able to resolve it
    // @ts-ignore
    ReactDOM.render(shortcutElement, document.createElement('globalShortcuts'));
    //todo removing shortcut does not work?
}

updateShortcuts()
