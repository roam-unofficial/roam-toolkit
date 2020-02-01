import {getActiveEditElement, getInputEvent, ValueElement} from './dom';

export const Roam = {
    pressEnter() {
        const event = new KeyboardEvent('keydown', {
            bubbles: true,
            cancelable: true,
            // @ts-ignore
            keyCode: 13
        });
        document?.activeElement?.dispatchEvent(event);
    },

    save(roamNode: RoamNode) {
        console.log(`Saving, ${roamNode}`);
        const roamElement = this.getActiveRoamElement();
        if (roamElement) {
            roamElement.value = roamNode.text;
            roamElement.dispatchEvent(getInputEvent());
        }
    },

    getActiveRoamElement(): ValueElement | null {
        const element = getActiveEditElement();
        if (element.tagName.toLocaleLowerCase() !== 'textarea') {
            return null
        }
        return element
    },

    getActiveRoamNode(): RoamNode | null {
        const element = this.getActiveRoamElement();
        if (!element) return null;

        return new RoamNode(element.value)
    },

    applyToCurrent(action: (node: RoamNode) => RoamNode) {
        const node = this.getActiveRoamNode();
        if (!node) return;

        this.save(action(node));
    }
};

export class RoamNode {
    readonly text: string;

    constructor(text: string) {
        this.text = text;
    }
}