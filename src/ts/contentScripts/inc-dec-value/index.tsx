import {getActiveEditElement, getInputEvent} from '../../utils/dom';
import {Feature, Shortcut} from '../../utils/settings'
import {dateFromPageName, RoamDate} from '../../date/common';

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

const saveChanges = (el: HTMLTextAreaElement, cursor: number, value: string): void => {
    el.value = value;
    el.selectionStart = cursor;
    el.selectionEnd = cursor;
    el.dispatchEvent(getInputEvent());
};

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
    const element = getActiveEditElement() as HTMLTextAreaElement;
    if (element.nodeName === 'TEXTAREA') {
        const itemContent = element.value;
        const cursor = element.selectionStart;
        const datesInContent = itemContent.match(RoamDate.regex);

        if (cursorPlacedOnDate(itemContent, cursor)) { // e.g. Lorem ipsum [[Janu|ary 3rd, 2020]] 123
            const newValue = itemContent.substring(0, openBracketsLeftIndex(itemContent, cursor))
                + RoamDate.format(dateModified(dateFromPageName(nameInsideBrackets(itemContent, cursor)), modType))
                + itemContent.substring(closingBracketsRightIndex(itemContent, cursor) + 2);
            saveChanges(element, cursor, newValue);
        } else if (cursorPlacedOnNumber(itemContent, cursor)) { // e.g. Lorem ipsum [[January 3rd, 2020]] 12|3
            const left = itemContent.substring(0, cursor)?.match(/[0-9]*$/)![0];
            const right = itemContent.substring(cursor)?.match(/^[0-9]*/)![0];
            const numberStr = left + right;
            const numberStartedAt = itemContent.substring(0, cursor)?.match(/[0-9]*$/)?.index!;
            let nr = parseInt(numberStr);
            if (modType === 'increase') {
                nr++;
            } else if (modType === 'decrease') {
                nr--;
            }
            const newValue = itemContent.substring(0, numberStartedAt)
                + nr
                + itemContent.substring(numberStartedAt + numberStr.length);
            saveChanges(element, cursor, newValue);
        } else if (datesInContent && datesInContent.length === 1) { // e.g. Lor|em ipsum [[January 3rd, 2020]] 123
            const newValue = itemContent.replace(datesInContent[0],
                RoamDate.format(dateModified(dateFromPageName(datesInContent[0]), modType)));
            saveChanges(element, cursor, newValue);
        }
    }
}

