import { browser } from 'webextension-polyfill-ts';

type ValueElement = HTMLTextAreaElement | HTMLInputElement | HTMLSelectElement;

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

const parseDate = (date: string): Date => {
	return new Date(
		date
			.slice(2)
			.slice(0, -2)
			.replace(/(th,|nd,|rd,|st,)/, ',')
	);
};

const createDateStr = (d: Date): string => {
	const year = d.getFullYear();
	const date = d.getDate();
	const month = months[d.getMonth()];
	const nthStr = nth(date);
	return `[[${month} ${date}${nthStr}, ${year}]]`;
};

const saveChanges = (el: HTMLInputElement, cursor: number, value: string): void => {
	el.value = value;
	el.selectionStart = cursor;
	el.selectionEnd = cursor;
	el.focus();
	el.dispatchEvent(inputEvent);
};

function modifyValue(modType: string) {
	const el = getRealEdit() as any;

	if (el.nodeName === 'TEXTAREA') {
		const value = el.value;
		const cursor = el.selectionStart ? el.selectionStart : 0;

		const openBracketsLeftIndex = value.substring(0, cursor).lastIndexOf('[[');
		const closingBracketsLeftIndex = value.substring(0, cursor).lastIndexOf(']]');
		const closingBracketsRightIndex = cursor + value.substring(cursor).indexOf(']]');

		if (openBracketsLeftIndex < closingBracketsRightIndex && closingBracketsLeftIndex < openBracketsLeftIndex) {
			const dateStr = value.substring(
				openBracketsLeftIndex,
				closingBracketsRightIndex + 2
			);
			if (dateStr.match(dateRegex) !== null) {
				const date = parseDate(dateStr);
				if (modType === 'increase') {
					date.setDate(date.getDate() + 1);
				} else if (modType === 'decrease') {
					date.setDate(date.getDate() - 1);
				}
				const newValue = value.substring(0, openBracketsLeftIndex) + createDateStr(date) + value.substring(closingBracketsRightIndex + 2);
				saveChanges(el, cursor, newValue);
				return;
			}
		}

		const a = value.substring(0, cursor).match(/[0-9]*$/)[0];
		const b = value.substring(cursor).match(/^[0-9]*/)[0];
		const numberStr = a + b;
		const numberStartedAt = value.substring(0, cursor).match(/[0-9]*$/).index;

		if (numberStr !== '') {
			let nr = parseInt(numberStr);
			if (modType === 'increase') {
				nr++;
			} else if (modType === 'decrease') {
				nr--;
			}
			const newValue = value.substring(0, numberStartedAt) + nr + value.substring(numberStartedAt + numberStr.length);
			saveChanges(el, cursor, newValue);
		}

	}
}

browser.runtime.onMessage.addListener((command) => {
	if (command === 'increase-value') {
		modifyValue('increase');
	}
	if (command === 'decrease-value') {
		modifyValue('decrease');
	}
});



function getRealEdit(): ValueElement {
	// stolen from Surfingkeys. Needs work.

	let rt = document.activeElement;
	// on some pages like chrome://history/, input is in shadowRoot of several other recursive shadowRoots.
	while (rt && rt.shadowRoot) {
		if (rt.shadowRoot.activeElement) {
			rt = rt.shadowRoot.activeElement;
		} else if (rt.shadowRoot.querySelector('input, textarea, select')) {
			rt = rt.shadowRoot.querySelector('input, textarea, select');
			break;
		} else {
			break;
		}
	}
	// if (rt === window) {
	//     rt = document.body;
	// }
	return rt as ValueElement;
}