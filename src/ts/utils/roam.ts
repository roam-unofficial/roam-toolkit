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

        return new RoamNode(element.value, window.getSelection()!)
    }
};

export class RoamNode {
    selection: Selection;
    private _text: string;
    set text(value: string) {
        this._text = value;
        Roam.save(this)
    }

    get text(): string {
        return this._text;
    }

    constructor(text: string, selection: Selection) {
        this._text = text;
        this.selection = selection;
    }
}