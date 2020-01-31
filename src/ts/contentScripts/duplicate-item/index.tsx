import { browser } from 'webextension-polyfill-ts';

type ValueElement = HTMLTextAreaElement | HTMLInputElement | HTMLSelectElement;


const pasteEvent = new Event('input', {
	bubbles: true,
	cancelable: true,
});
const inputEvent = new Event('input', {
	bubbles: true,
	cancelable: true,
});

const duplicate = () => {
	const element = getRealEdit() as any;

	if (element.nodeName === 'TEXTAREA') {
		const itemContent = element.value;
		// const cursor = element.selectionStart;
		// element.select()
		element.value = '';
		element.dispatchEvent(inputEvent);
		// element.selectionStart = 0;
		// element.selectionEnd = 0;
		navigator.clipboard.writeText(itemContent + '\r\n' + itemContent).then(() => {
			document.execCommand('paste')
			element.dispatchEvent(pasteEvent);
		});
	}
}

browser.runtime.onMessage.addListener((command) => {
	if (command === 'duplicate-item') {
		duplicate();
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