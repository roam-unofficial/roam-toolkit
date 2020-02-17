export type ValueElement = HTMLTextAreaElement | HTMLInputElement | HTMLSelectElement;

export function getActiveEditElement(): ValueElement {
    // stolen from Surfingkeys. Needs work.

    let element = document.activeElement;
    // on some pages like chrome://history/, input is in shadowRoot of several other recursive shadowRoots.
    while (element && element.shadowRoot) {
        if (element.shadowRoot.activeElement) {
            element = element.shadowRoot.activeElement;
        } else {
            const subElement = element.shadowRoot.querySelector('input, textarea, select');
            if (subElement) {
                element = subElement;
            }
            break;
        }
    }
    return element as ValueElement;
}

export function getTopLevelBlockList() {
    return document.querySelector('.roam-article div .flex-v-box') as HTMLElement;
}

export function getLastTopLevelBlock() {
  const lastChild = getTopLevelBlockList().lastChild as HTMLElement;
    console.log('bottom-block: ', lastChild);
  return lastChild.querySelector('.roam-block, textarea') as HTMLElement; 
}

export function getFirstTopLevelBlock() {
  const firstChild = getTopLevelBlockList().firstChild as HTMLElement;
    console.log('top-block: ', firstChild);
  return firstChild.querySelector('.roam-block, textarea') as HTMLElement; 
}

export function getInputEvent() {
    return new Event('input', {
        bubbles: true,
        cancelable: true,
    });
}