import {pickBy, mapValues, Dictionary} from 'lodash'

import {Handler, Hotkey, KeySequence} from './hotkey'

export class Hotkeys {
    private actionToHotkey: Dictionary<Hotkey>

    static fromKeyMapAndHandlers(actionToKeySequence: Dictionary<KeySequence>, actionToHandler: Dictionary<Handler>) {
        const actionToHotkey: Dictionary<Hotkey> = {}
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
    constructor(actionToHotkey: Dictionary<Hotkey>) {
        this.actionToHotkey = actionToHotkey
    }

    singleChordHotkeys() {
        return new Hotkeys(
            pickBy(this.actionToHotkey, hotkey => !hotkey.usesMultipleKeyChords())
        )
    }

    multiChordHotkeys() {
        return new Hotkeys(
            pickBy(this.actionToHotkey, hotkey => hotkey.usesMultipleKeyChords())
        )
    }

    actionToKeySequence() {
        return mapValues(this.actionToHotkey, hotkey => hotkey.fixedKeySequence())
    }

    actionToHandler() {
        return mapValues(this.actionToHotkey, hotkey => hotkey.fixedHandler())
    }
}
