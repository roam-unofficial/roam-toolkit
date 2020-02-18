import { delay } from './async';

export const Mouse = {
  standardDelay: 0,
  simulateClick(buttons: number, element: HTMLElement, additionalDelay: number = 0) {
    const mouseClickEvents = ['mousedown', 'click', 'mouseup'];
    mouseClickEvents.forEach(mouseEventType => {
      element.dispatchEvent(
        new MouseEvent(mouseEventType, {
          view: window,
          bubbles: true,
          cancelable: true,
          buttons
        })
      );
    });
    return delay(this.standardDelay + additionalDelay);
  },
  leftClick(element: HTMLElement, additionalDelay:number = 0) {
    return this.simulateClick(1, element, additionalDelay);
  }
};
