import {Feature, Shortcut} from '../settings'
import {RoamDate} from '../roam/date'
import {Roam} from '../roam/roam'
import {RoamNode, Selection} from '../roam/roam-node'

const createModifier = (change: number) => (num: number) => num + change

export const config: Feature = {
    id: 'incDec',
    name: 'Increase / Decrease value or date',
    settings: [
        {
            type: 'shortcut',
            id: 'incShortcut',
            label: 'Increase date or number by 1',
            initValue: 'Ctrl+Alt+ArrowUp',
            onPress: () => modify(createModifier(1)),
        } as Shortcut,
        {
            type: 'shortcut',
            id: 'decShortcut',
            label: 'Decrease date or number by 1',
            initValue: 'Ctrl+Alt+ArrowDown',
            onPress: () => modify(createModifier(-1)),
        } as Shortcut,
        {
            type: 'shortcut',
            id: 'incWeekShortcut',
            label: 'Increase date or number by 7',
            initValue: 'Ctrl+Alt+PageUp',
            onPress: () => modify(createModifier(7)),
        } as Shortcut,
        {
            type: 'shortcut',
            id: 'decWeekShortcut',
            label: 'Decrease date or number by 7',
            initValue: 'Ctrl+Alt+PageDown',
            onPress: () => modify(createModifier(-7)),
        } as Shortcut,
    ],
}

const openBracketsLeftIndex = (text: string, cursor: number): number => text.substring(0, cursor).lastIndexOf('[[')

const closingBracketsLeftIndex = (text: string, cursor: number): number => text.substring(0, cursor).lastIndexOf(']]')

const closingBracketsRightIndex = (text: string, cursor: number): number =>
    cursor + text.substring(cursor).indexOf(']]')

const cursorPlacedBetweenBrackets = (text: string, cursor: number): boolean =>
    openBracketsLeftIndex(text, cursor) < closingBracketsRightIndex(text, cursor) &&
    closingBracketsLeftIndex(text, cursor) < openBracketsLeftIndex(text, cursor)

const cursorPlacedOnNumber = (text: any, cursor: number): boolean =>
    text.substring(0, cursor).match(/[0-9]*$/)[0] + text.substring(cursor).match(/^[0-9]*/)[0] !== ''

const cursorPlacedOnDate = (text: string, cursor: number): boolean =>
    cursorPlacedBetweenBrackets(text, cursor) && nameIsDate(nameInsideBrackets(text, cursor))

const nameInsideBrackets = (text: string, cursor: number): string =>
    text.substring(text.substring(0, cursor).lastIndexOf('[['), cursor + text.substring(cursor).indexOf(']]') + 2)

const nameIsDate = (pageName: string): boolean => pageName.match(RoamDate.regex) !== null

const modifyDate = (date: Date, modifier: (input: number) => number): Date => {
    const newDate = new Date(date)
    newDate.setDate(modifier(date.getDate()))
    return newDate
}

export const modify = (modifier: (input: number) => number) => {
    const node = Roam.getActiveRoamNode()
    if (!node) return

    const cursor = node.selection.start
    const datesInContent = node.text.match(RoamDate.regex)

    let newValue = node.text

    if (cursorPlacedOnDate(node.text, cursor)) {
        // e.g. Lorem ipsum [[Janu|ary 3rd, 2020]] 123
        newValue =
            node.text.substring(0, openBracketsLeftIndex(node.text, cursor)) +
            RoamDate.formatPage(
                modifyDate(RoamDate.parseFromReference(nameInsideBrackets(node.text, cursor)), modifier)
            ) +
            node.text.substring(closingBracketsRightIndex(node.text, cursor) + 2)
    } else if (cursorPlacedOnNumber(node.text, cursor)) {
        // e.g. Lorem ipsum [[January 3rd, 2020]] 12|3
        const left = node.text.substring(0, cursor)?.match(/[0-9]*$/)![0]
        const right = node.text.substring(cursor)?.match(/^[0-9]*/)![0]
        const numberStr = left + right
        const numberStartedAt = node.text.substring(0, cursor)?.match(/[0-9]*$/)?.index!

        let number = modifier(parseInt(numberStr))
        newValue =
            node.text.substring(0, numberStartedAt) + number + node.text.substring(numberStartedAt + numberStr.length)
    } else if (datesInContent && datesInContent.length === 1) {
        // e.g. Lor|em ipsum [[January 3rd, 2020]] 123
        newValue = node.text.replace(
            datesInContent[0],
            RoamDate.formatPage(modifyDate(RoamDate.parseFromReference(datesInContent[0]), modifier))
        )
    }
    Roam.save(new RoamNode(newValue, new Selection(cursor, cursor)))
}
