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

    async editBlock(element: HTMLElement) {
        return Mouse.leftClick(element,20)
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
                    // new Selection(node.text.length * 2, node.text.length * 2)
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
    },

    async createSiblingAbove() {
        this.moveCursorToStart();
        const isEmpty = !this.getActiveRoamNode()?.text;
        await Keyboard.pressEnter(20);
        if (isEmpty) {
            await Keyboard.simulateKey(38,20); //Up Arrow
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
        await Keyboard.simulateKey(39,20); //Right Arrow
        await Keyboard.pressEnter(20);
    },
    
    async createBlockAtTop(){
        // const tlb = getFirstTopLevelBlock();
        // await Mouse.leftClick(tlb,20);
        await this.editBlock(getFirstTopLevelBlock());
        await this.createSiblingAbove();
    },
    
    async createBlockAtBottom(){
        await this.editBlock(getLastTopLevelBlock());
        // const tlb = getLastTopLevelBlock();
        // await Mouse.leftClick(tlb,20);
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