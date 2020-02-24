import { delay } from './async';

export const Mouse = {
  standardDelay: 20,
  simulateClick(buttons: number, element: HTMLElement, additionalDelay: number = 0) {
    const mouseClickEvents = ['mousedown', 'click', 'mouseup'];
    mouseClickEvents.forEach(mouseEventType => {
      element.dispatchEvent(getMouseEvent(mouseEventType, buttons));
    });
    return delay(this.standardDelay + additionalDelay);
  },
  leftClick(element: HTMLElement, additionalDelay:number = 0) {
    return this.simulateClick(1, element, additionalDelay);
  }
};

const getMouseEvent = (mouseEventType: string, buttons: number) => 
    new MouseEvent(mouseEventType, {
        view: window,
        bubbles: true,
        cancelable: true,
        buttons
    });


