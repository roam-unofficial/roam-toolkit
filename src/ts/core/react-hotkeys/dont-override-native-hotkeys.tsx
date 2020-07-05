import {GlobalHotKeys, KeyMap} from 'react-hotkeys'
import React from 'react'
import {Dictionary} from 'lodash'

import {Handler} from './key-handler'
import {KeySequenceString} from './key-sequence'

/**
 * Don't trigger the single letter shortcuts when pressing native keybindings such as "cmd+u".
 * See https://github.com/greena13/react-hotkeys/issues/234#issuecomment-612687273
 */
const NATIVE_HOTKEYS_TO_IGNORE: KeySequenceString[] = [
    'command+a',
    'command+c',
    'command+q',
    'command+r',
    'command+u',
    'command+v',
    'command+w',
    'command+x',
]

type Props = {
    keyMap: KeyMap
    handlers: Dictionary<Handler>
}

export const GlobalHotKeysWithoutConflictingWithNativeHotkeys = ({keyMap, handlers}: Props) => (
    <GlobalHotKeys
        keyMap={{
            IGNORE: NATIVE_HOTKEYS_TO_IGNORE,
            ...keyMap,
        }}
        handlers={{
            IGNORE: () => {},
            ...handlers,
        }}
        allowChanges={true}
    />
)
