import { getActiveEditElement } from '../../utils/dom';
import { Feature } from '../../utils/settings'

export const config: Feature = {
    id: 'incDec',
    name: 'Increase / Decrease value or date',
    settings: [
        {
            type: 'shortcut', id: 'incShortcut', label: 'Shortcut for +1 value/date', initValue: 'Ctrl+Alt+ArrowUp',
            onPress: () => modify('increase')
        },
        {
            type: 'shortcut', id: 'decShortcut', label: 'Shortcut for -1 value/date', initValue: '', placeholder: 'e.g. Ctrl+Alt+ArrowDown',
            onPress: () => modify('decrease')
        },
    ]
}










const inputEvent = new Event('input', {
    bubbles: true,
    cancelable: true,
});

const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
];

const nth = (d: number) => {
    if (d > 3 && d < 21) return 'th';
    switch (d % 10) {
        case 1:
            return 'st';
        case 2:
            return 'nd';
        case 3:
            return 'rd';
        default:
            return 'th';
    }
};

const dateRegex = /\[\[(January|February|March|April|May|June|July|August|September|October|November|December) \d{1,2}(st|nd|th|rd), \d{4}\]\]/gm;

const dateFromPageName = (text: string): Date => {
    return new Date(
        text
            .slice(2)
            .slice(0, -2)
            .replace(/(th,|nd,|rd,|st,)/, ',')
    );
};

const dateStrFormatted = (d: Date): string => {
    const year = d.getFullYear();
    const date = d.getDate();
    const month = months[d.getMonth()];
    const nthStr = nth(date);
    return `[[${month} ${date}${nthStr}, ${year}]]`;
};

const saveChanges = (el: HTMLTextAreaElement, cursor: number, value: string): void => {
    el.value = value;
    el.selectionStart = cursor;
    el.selectionEnd = cursor;
    el.dispatchEvent(inputEvent);
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
    pageName.match(dateRegex) !== null

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
        const datesInContent = itemContent.match(dateRegex);

        if (cursorPlacedOnDate(itemContent, cursor)) { // e.g. Lorem ipsum [[Janu|ary 3rd, 2020]] 123
            const newValue = itemContent.substring(0, openBracketsLeftIndex(itemContent, cursor))
                + dateStrFormatted(dateModified(dateFromPageName(nameInsideBrackets(itemContent, cursor)), modType))
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
                dateStrFormatted(dateModified(dateFromPageName(datesInContent[0]), modType)));
            saveChanges(element, cursor, newValue);
        }
    }
}

