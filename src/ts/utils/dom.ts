export type ValueElement = HTMLTextAreaElement | HTMLInputElement | HTMLSelectElement;

export function getActiveEditElement(): ValueElement {
    // stolen from Surfingkeys. Needs work.

    let element = document.activeElement;
    // on some pages like chrome://history/, input is in shadowRoot of several other recursive shadowRoots.
    while (element?.shadowRoot) {
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

export function getTopLevelBlocks() {
    return document.querySelector('.roam-article div .flex-v-box') as HTMLElement;
}

export function getLastTopLevelBlock() {
  const lastChild = getTopLevelBlocks().lastChild as HTMLElement;
  return lastChild.querySelector('.roam-block, textarea') as HTMLElement; 
}

export function getFirstTopLevelBlock() {
  const firstChild = getTopLevelBlocks().firstChild as HTMLElement;
  return firstChild.querySelector('.roam-block, textarea') as HTMLElement; 
}

export function getInputEvent() {
    return new Event('input', {
        bubbles: true,
        cancelable: true,
    });
}

export function detectChange(fn: () => void){
    const targetNode = document.querySelector('.roam-body-main') as HTMLElement;
    const config = { attributes: true, childList: true, subtree: true };
    return new Promise(resolve => {
        const callback = function(mutationsList:MutationRecord[], observer: MutationObserver) {
            // Use traditional 'for loops' for IE 11
            console.log(mutationsList)
            // for(let mutation of mutationsList) {
            //     if (mutation.type === 'childList') {
            //         console.log('A child node has been added or removed.');
            //     }
            //     else if (mutation.type === 'attributes') {
            //         console.log('The ' + mutation.attributeName + ' attribute was modified.');
            //     }
            // }
            resolve('mutated')
            observer.disconnect();
        };
        const observer = new MutationObserver(callback);
        observer.observe(targetNode, config);
        fn();
    })
}