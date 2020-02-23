import {getActiveEditElement, getInputEvent, getLastTopLevelBlock, getFirstTopLevelBlock} from './dom';
import {Keyboard} from './keyboard';
import { Mouse } from './mouse';

export const Roam = {
    save(roamNode: RoamNode) {
        console.log(`Saving`, roamNode);
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

    async activateBlock(element: HTMLElement) {
        if (
            element.classList.contains('roam-block') || 
            element.tagName.toLocaleLowerCase() === 'textarea'
        ) {
            await Mouse.leftClick(element,20)
        } 
        return this.getRoamBlockInput();
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
    },

    moveCursorToStart() {
        this.applyToCurrent(
            node =>
                new RoamNode(
                    node.text,
                        new Selection(0,0)
                ))
    },

    moveCursorToEnd() {
        this.applyToCurrent(
            node =>
                new RoamNode(
                    node.text,
                    new Selection(node.text.length * 2, node.text.length * 2)
                ))
    },

    writeText(text: string) {
        this.applyToCurrent(node => 
            new RoamNode(text, node.selection));
        return this.getActiveRoamNode()?.text === text;
    },

    async createSiblingAbove() {
        this.moveCursorToStart();
        const isEmpty = !this.getActiveRoamNode()?.text;
        await Keyboard.pressEnter(20);
        if (isEmpty) {
            await Keyboard.simulateKey(Keyboard.UP_ARROW,20);
        }
    },
    
    async createSiblingBelow() {
        this.moveCursorToEnd();
        await Keyboard.pressEnter(20);
        await Keyboard.pressShiftTab(40);
    },

    async createFirstChild() {
        this.moveCursorToEnd();
        await Keyboard.pressEnter(20);
        await Keyboard.pressTab(20);
    },

    async createLastChild() {
        await this.createSiblingBelow();
        await Keyboard.pressTab(20);
    },

    async createDeepestLastDescendant() {
        await this.selectBlock();
        await Keyboard.simulateKey(Keyboard.RIGHT_ARROW,20);
        await Keyboard.pressEnter(20);
    },
    
    async createBlockAtTop(){
        await this.activateBlock(getFirstTopLevelBlock());
        await this.createSiblingAbove();
    },
    
    async createBlockAtBottom(){
        await this.activateBlock(getLastTopLevelBlock());
        await this.createSiblingBelow();
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