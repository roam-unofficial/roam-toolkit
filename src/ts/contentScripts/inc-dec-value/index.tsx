import {Feature, Shortcut} from '../../utils/settings'
import {dateFromPageName, RoamDate} from '../../date/common';
import {Roam} from '../../roam/roam';
import {RoamNode, Selection} from '../../roam/roam-node';

export const config: Feature = {
    id: 'incDec',
    name: 'Increase / Decrease value or date',
    settings: [
        {
            type: 'shortcut',
            id: 'incShortcut',
            label: 'Shortcut for +1 value/date',
            initValue: 'Ctrl+Alt+ArrowUp',
            onPress: () => modify('increase')
        } as Shortcut,
        {
            type: 'shortcut',
            id: 'decShortcut',
            label: 'Shortcut for -1 value/date',
            initValue: 'Ctrl+Alt+ArrowDown',
            onPress: () => modify('decrease')
        } as Shortcut,
    ]
}

const openBracketsLeftIndex = (text: string, cursor: number): number =>
    text.substring(0, cursor).lastIndexOf('[[')

const closingBracketsLeftIndex = (text: string, cursor: number): number =>
    text.substring(0, cursor).lastIndexOf(']]')

const closingBracketsRightIndex = (text: string, cursor: number): number =>
    cursor + text.substring(cursor).indexOf(']]')

const cursorPlacedBetweenBrackets = (text: string, cursor: number): boolean =>
    openBracketsLeftIndex(text, cursor) < closingBracketsRightIndex(text, cursor)
    && closingBracketsLeftIndex(text, cursor) < openBracketsLeftIndex(text, cursor)

const cursorPlacedOnNumber = (text: any, cursor: number): boolean =>
    text.substring(0, cursor).match(/[0-9]*$/)[0] + text.substring(cursor).match(/^[0-9]*/)[0] !== ''

const cursorPlacedOnDate = (text: string, cursor: number): boolean =>
    cursorPlacedBetweenBrackets(text, cursor) && nameIsDate(nameInsideBrackets(text, cursor))

const nameInsideBrackets = (text: string, cursor: number): string =>
    text.substring(text.substring(0, cursor).lastIndexOf('[['), cursor + text.substring(cursor).indexOf(']]') + 2)

const nameIsDate = (pageName: string): boolean =>
    pageName.match(RoamDate.regex) !== null

const dateModified = (date: Date, modType: string): Date => {
    const newDate = new Date(date.valueOf());
    if (modType === 'increase') {
        newDate.setDate(date.getDate() + 1);
    } else if (modType === 'decrease') {
        newDate.setDate(date.getDate() - 1);
    }
    return newDate;
}

export const modify = (modType: string) => {
    const node = Roam.getActiveRoamNode()
    if (!node) return

    const cursor = node.selection.start;
    const datesInContent = node.text.match(RoamDate.regex);

    let newValue = node.text

    if (cursorPlacedOnDate(node.text, cursor)) { // e.g. Lorem ipsum [[Janu|ary 3rd, 2020]] 123
        newValue = node.text.substring(0, openBracketsLeftIndex(node.text, cursor))
            + RoamDate.formatPage(dateModified(dateFromPageName(nameInsideBrackets(node.text, cursor)), modType))
            + node.text.substring(closingBracketsRightIndex(node.text, cursor) + 2);
    } else if (cursorPlacedOnNumber(node.text, cursor)) { // e.g. Lorem ipsum [[January 3rd, 2020]] 12|3
        const left = node.text.substring(0, cursor)?.match(/[0-9]*$/)![0];
        const right = node.text.substring(cursor)?.match(/^[0-9]*/)![0];
        const numberStr = left + right;
        const numberStartedAt = node.text.substring(0, cursor)?.match(/[0-9]*$/)?.index!;
        let number = parseInt(numberStr);
        if (modType === 'increase') {
            number++;
        } else if (modType === 'decrease') {
            number--;
        }
        newValue = node.text.substring(0, numberStartedAt)
            + number
            + node.text.substring(numberStartedAt + numberStr.length);
    } else if (datesInContent && datesInContent.length === 1) { // e.g. Lor|em ipsum [[January 3rd, 2020]] 123
        newValue = node.text.replace(datesInContent[0],
            RoamDate.formatPage(dateModified(dateFromPageName(datesInContent[0]), modType)));
    }
    Roam.save(new RoamNode(newValue, new Selection(cursor, cursor)))
}

