import * as chrono from 'chrono-node'
import {afterClosingBrackets} from '../common/brackets'
import {RoamDate} from '../roam/date'
import {RoamNode, Selection} from '../roam/roam-node'
import {Roam} from '../roam/roam'
import {NodeWithDate} from '../roam/date/withDate'

import {Feature, Settings} from '../settings'
import {Browser} from '../common/browser'

export const config: Feature = {
    id: 'fuzzy-date',
    name: 'Fuzzy Date',
    enabledByDefault: true,
    settings: [{type: 'string', id: 'guard', initValue: ';', label: 'Guard symbol'}],
}

const checkSettingsAndToggleFuzzyDate = () => {
    Settings.isActive(config.id).then(active => (active ? registerEventListener() : removeEventListener()))
}

checkSettingsAndToggleFuzzyDate()

Browser.addMessageListener(async message => {
    if (message === 'settings-updated') {
        checkSettingsAndToggleFuzzyDate()
    }
})

const getCursor = (node: RoamNode, newText: string, searchStart: number = 0) =>
    node.text === newText ? node.selection.start : afterClosingBrackets(newText, searchStart)

export function replaceFuzzyDate(guard: string) {
    const dateContainerExpr = new RegExp(`${guard}\(\.\{3,\}\?\)${guard}`, 'gm')

    Roam.applyToCurrent(node => {
        const oddMatches = node.text.match(dateContainerExpr)
        const firstGuardIndex = node.text.indexOf(guard)
        const evenMatches = node.text.slice(firstGuardIndex + 1).match(dateContainerExpr)
        if (!oddMatches) return node

        const allMatches = evenMatches ? oddMatches.concat(evenMatches) : oddMatches
        for (let i = 0; i < allMatches.length; i++) {
            let dateStr = allMatches[i]
            const date = chrono.parseDate(dateStr, new Date(), {
                forwardDate: true,
            })
            if (date) {
                const fuzzy_date_text = chrono.parse(dateStr)[0].text.trim()
                const replaceMode = dateStr.startsWith(';:')
                const validFuzzyDate = replaceMode || dateStr === `${guard}${fuzzy_date_text}${guard}`
                if (validFuzzyDate) {
                    const replaceWith = replaceMode ? '' : RoamDate.formatPage(date)
                    const newText = node.text.replace(dateStr, replaceWith)
                    const cursor = getCursor(node, newText, replaceMode ? 0 : node.selection.start)
                    const newNode = new NodeWithDate(newText, new Selection(cursor, cursor))
                    return replaceMode ? newNode.withDate(date) : newNode
                }
            }
        }
        return node
    })
}

/**
 * We use `keypress`, since `keyup` is sometimes firing for individual keys instead of the pressed key
 * when the guard character is requiring a multi-key stroke.
 *
 * `setTimeout` is used to put the callback to the end of the event queue,
 * since the input is not yet changed when keypress is firing.
 */
const registerEventListener = () => {
    document.addEventListener('keypress', keypressListener)
}

const removeEventListener = () => {
    document.removeEventListener('keypress', keypressListener)
}

const keypressListener = (ev: KeyboardEvent) => {
    Settings.get(config.id, 'guard').then((value: string) => {
        if (ev.key === value) {
            setTimeout(() => replaceFuzzyDate(value), 0)
        }
    })
}
