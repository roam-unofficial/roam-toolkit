export const Keyboard = {
    simulateKey(code: number) {
        const event = new KeyboardEvent('keydown', {
            bubbles: true,
            cancelable: true,
            // @ts-ignore
            keyCode: code
        });
        document?.activeElement?.dispatchEvent(event);
    },
    pressEnter() {
        this.simulateKey(13)
    },
    pressEsc() {
        this.simulateKey(27)
    },
    pressBackspace() {
        this.simulateKey(8)
    }
};
