import {browser} from 'webextension-polyfill-ts';

import {createDomAnchor} from '../../scripts/dom';

createDomAnchor('counter-root');

const inputEvent = new Event('input', {
    bubbles: true,
    cancelable: true,
});

const bucketExpr = /\[\[Bucket (\d+)]]/;

const nextBucket = (nodeStr: string) => `[[Bucket ${parseInt(nodeStr) + 1}]]`;

function triggerNextBucket() {
    const element = getRealEdit()!;
    console.log(element);
    if (element.tagName.toLocaleLowerCase() !== 'textarea') {
        return
    }

    element.value = element.value!.replace(bucketExpr, (_, numStr: string) => nextBucket(numStr));
    element.dispatchEvent(inputEvent);
}

browser.runtime.onMessage.addListener((command) => {
    if (command === 'srs-next-bucket') {
        console.log('Toggling the feature!');
        triggerNextBucket();
    }
});

type ValueElement = HTMLTextAreaElement | HTMLInputElement | HTMLSelectElement;

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