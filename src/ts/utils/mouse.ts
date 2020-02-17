export const Mouse = {
  simulateClick(buttons: number, element: HTMLElement) {
    console.log('[Click]');
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
  },
  leftClick(element: HTMLElement) {
      return this.simulateClick(1, element)
  }

};
