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


export function getInputEvent() {
    return new Event('input', {
        bubbles: true,
        cancelable: true,
    });
}

function addDelayAfterInput(fn: void, ms: number) {
    return new Promise(res => {
        fn;
        setTimeout(res,ms);
    })
}

function simulateUserInput(input: void) {
    return addDelayAfterInput(input,20);
}

export async function simulateMouseClick(element: HTMLElement) {
    return simulateUserInput(mouseClick(element))
}

export async function simulateKeyPress(element: HTMLElement, keyCode: number) {
    return simulateUserInput(keyPress(element, keyCode))
}

export async function pressEnter(element?: HTMLElement) {
    return simulateUserInput(keyPress(element, 13))
}

export async function pressESC(element?: HTMLElement) {
    return simulateUserInput(keyPress(element, 27))
}

export async function pressBackspace(element?: HTMLElement) {
    return simulateUserInput(keyPress(element, 8))
}

export async function pressShiftTab(element?: HTMLElement) {
    return simulateUserInput(keyPress(element, 9, {shiftKey: true}))
}

function mouseClick(element: HTMLElement) {
    console.log('[Click]');
    const mouseClickEvents = ['mousedown', 'click', 'mouseup'];
    mouseClickEvents.forEach(mouseEventType => {
      element.dispatchEvent(
        new MouseEvent(mouseEventType, {
          view: window,
          bubbles: true,
          cancelable: true,
          buttons: 1
        })
      );
    });
  }

const keyPress = (element = getActiveEditElement() as HTMLElement, keyCode: number, opts?: KeyboardEventInit) => {   
    element.dispatchEvent( 
        new KeyboardEvent('keydown', {
            bubbles: true,
            cancelable: true,
            //@ts-ignore
            keyCode,
            ...opts
        })
        )  
}