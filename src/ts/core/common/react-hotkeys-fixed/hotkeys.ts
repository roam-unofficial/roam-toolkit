// @ts-ignore this internal import is needed to workaround a react-hotkeys issue
import {filterObjectValues, mapObjectValues, ObjectMap} from 'SRC/core/common/object'

import {Handler, Hotkey, KeySequence} from './hotkey'

export class Hotkeys {
    private actionToHotkey: ObjectMap<Hotkey>

    static fromKeyMapAndHandlers(actionToKeySequence: ObjectMap<KeySequence>, actionToHandler: ObjectMap<Handler>) {
        const actionToHotkey: ObjectMap<Hotkey> = {}
        Object.keys(actionToKeySequence).forEach(action => {
            actionToHotkey[action] = new Hotkey(actionToKeySequence[action], actionToHandler[action])
        })
        return new Hotkeys(actionToHotkey)
    }

    /**
     * React Hotkeys decouples the key sequence from the handler by design.
     *
     * We temporarily recouple them them back together, in order to determine
     * whether the handler needs to be blocked from running during other handlers.
     * See dont-trigger-hotkeys-with-simulated-presses
     */
    constructor(actionToHotkey: ObjectMap<Hotkey>) {
        this.actionToHotkey = actionToHotkey
    }

    singleChordHotkeys() {
        return new Hotkeys(
            filterObjectValues(this.actionToHotkey, hotkey => !hotkey.usesMultipleKeyChords())
        )
    }

    multiChordHotkeys() {
        return new Hotkeys(
            filterObjectValues(this.actionToHotkey, hotkey => hotkey.usesMultipleKeyChords())
        )
    }

    actionToKeySequence() {
        return mapObjectValues(this.actionToHotkey, hotkey => hotkey.fixedKeySequence())
    }

    actionToHandler() {
        return mapObjectValues(this.actionToHotkey, hotkey => hotkey.fixedHandler())
    }
}
