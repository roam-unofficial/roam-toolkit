import {getActiveEditElement, getInputEvent} from './dom';
import {Keyboard} from './keyboard';

export const Roam = {
    save(roamNode: RoamNode) {
        console.log(`Saving, ${roamNode}`);
        const roamElement = this.getRoamBlockInput();
        if (roamElement) {
            roamElement.value = roamNode.text;
            roamElement.selectionStart = roamNode.selection.start;
            roamElement.selectionEnd = roamNode.selection.end;

            roamElement.dispatchEvent(getInputEvent());
        }
    },

    getRoamBlockInput(): HTMLTextAreaElement | null {
        const element = getActiveEditElement();
        if (element.tagName.toLocaleLowerCase() !== 'textarea') {
            return null
        }
        return element as HTMLTextAreaElement
    },

    getActiveRoamNode(): RoamNode | null {
        const element = this.getRoamBlockInput();
        if (!element) return null;

        return new RoamNode(element.value, new Selection(element.selectionStart, element.selectionEnd))
    },

    applyToCurrent(action: (node: RoamNode) => RoamNode) {
        const node = this.getActiveRoamNode();
        if (!node) return;

        this.save(action(node));
    },

    async selectBlock() {
        if (this.getRoamBlockInput()) {
            return Keyboard.pressEsc(20);
        }
        return Promise.reject('We\'re currently not inside roam block');
    },

    async deleteBlock() {
        return this.selectBlock().then(
            () => Keyboard.pressBackspace());
    },

    async copyBlock() {
        await this.selectBlock();
        document.execCommand('copy');
    },

    async duplicateBlock() {
        await this.copyBlock();
        await Keyboard.pressEnter(15);
        await Keyboard.pressEnter();
        document.execCommand('paste')
    }
};

export class RoamNode {
    constructor(readonly text: string, readonly selection: Selection) {
    }

    selectedText(): string {
        return this.text.substring(this.selection.start, this.selection.end)
    }
}

export class Selection {
    constructor(readonly start: number, readonly end: number) {
    }
}