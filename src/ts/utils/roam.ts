import {DOM} from './dom';
import {Keyboard} from './keyboard';
import { Mouse } from './mouse';

export const Roam = {
    async save(roamNode: RoamNode) {
        console.log(`Saving`, roamNode);
        const roamElement = this.getRoamBlockInput();
        if (roamElement) {
            roamElement.value = roamNode.text;
            roamElement.selectionStart = roamNode.selection.start;
            roamElement.selectionEnd = roamNode.selection.end;
            await DOM.detectChange(() => roamElement.dispatchEvent(DOM.getInputEvent()))
            ;
        }
    },

    getRoamBlockInput(): HTMLTextAreaElement | null {
        const element = DOM.getActiveEditElement();
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

    async applyToCurrent(action: (node: RoamNode) => RoamNode) {
        const node = this.getActiveRoamNode();
        if (!node) return;

        await this.save(action(node));
    },

    async selectBlock() {
        if (this.getRoamBlockInput()) {
            return Keyboard.pressEsc();
        }
        return Promise.reject('We\'re currently not inside roam block');
    },

    async activateBlock(element: HTMLElement) {
        if (element.classList.contains('roam-block')) {
            await Mouse.leftClick(element)
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
        await Keyboard.pressEnter();
        await Keyboard.pressEnter();
        document.execCommand('paste')
    },

    async moveCursorToStart() {
        return this.applyToCurrent(node => node.withCursorAtTheStart())
    },

    async moveCursorToEnd() {
        return this.applyToCurrent(node => node.withCursorAtTheEnd())
    },

    async writeText(text: string) {
        await this.applyToCurrent(node => 
            new RoamNode(text, node.selection));
        return this.getActiveRoamNode()?.text === text;
    },
    hasChildren() {
        const thisBlock = this.getRoamBlockInput()!;
        return DOM.hasChildren(thisBlock);
    },
    hasSiblings() {
        const thisBlock = this.getRoamBlockInput() as HTMLElement;
        return DOM.hasSiblings(thisBlock);
    },
    isLastChild(){
        const thisBlock = this.getRoamBlockInput() as HTMLElement;
        return thisBlock === DOM.getLastSibling(thisBlock)
    },
    async goToParent() {
        const thisBlock = this.getRoamBlockInput() as HTMLElement;
        return this.activateBlock(DOM.getBlockParent(thisBlock))
    },
    async goToFirstChild() {
        const thisBlock = this.getRoamBlockInput() as HTMLElement;
        if (this.hasChildren()) {
            return this.activateBlock(DOM.getFirstChild(thisBlock))
        }
        return null;
    },
    async goToLastChild() {
        const thisBlock = this.getRoamBlockInput() as HTMLElement;
        if (this.hasChildren()) {
            return this.activateBlock(DOM.getLastChild(thisBlock))
        }
        return null;
    },
    isEmpty() {
        return !this.getActiveRoamNode()?.text;
    },
    async addPlaceholder() {
        if (this.isEmpty()) await this.writeText(' ');
        await this.moveCursorToEnd();
        return this.getRoamBlockInput()?.id as string;
    },
    async removePlaceholder(id: string) {
        const currentId = this.getRoamBlockInput()?.id as string;
        const placeholderElement = document.getElementById(id) as HTMLElement;
        await this.activateBlock(placeholderElement)
        await this.writeText('');
        const currentElement = document.getElementById(currentId) as HTMLElement;
        await this.activateBlock(currentElement);
    },
    async usePlaceholder(fn: ()=>void) {
        let placeholderId = '';
        if(this.isEmpty()){
            placeholderId = await this.addPlaceholder();
        }

        await fn();

        if (placeholderId) await this.removePlaceholder(placeholderId);
    },

    async createSiblingAbove(text?: string) {
        await this.usePlaceholder(async ()=> {
            await this.moveCursorToStart();
            await Keyboard.pressEnter();
        })
        if (text) await this.writeText(text);
    },
    
    async createSiblingBelow(text?: string) {
        await this.createFirstChild(text);
        await Keyboard.pressShiftTab(Keyboard.BASE_DELAY);
    },

    async createFirstChild(text?: string) {
        await this.moveCursorToEnd();
        if (this.hasChildren()) await Keyboard.pressEnter();
        else 
            await this.usePlaceholder( async () => {
                await Keyboard.pressEnter();
                await Keyboard.pressTab();
            })
        if (text) await this.writeText(text);
    },

    async createLastChild(text?: string) {
        await this.createSiblingBelow(text);
        await Keyboard.pressTab();
    },
    
    async createDeepestLastDescendant(text?: string) {
        await this.selectBlock();
        await Keyboard.simulateKey(Keyboard.RIGHT_ARROW);
        await this.createSiblingBelow();
        if (text) await this.writeText(text);
    },
    
    async createBlockAtTop(forceCreation:boolean = false, text?: string){
        await this.activateBlock(DOM.getFirstTopLevelBlock());
        if (this.getActiveRoamNode()?.text || forceCreation) {
            await this.createSiblingAbove();
        }
        if (text) await this.writeText(text);
    },
    
    async createBlockAtBottom(forceCreation:boolean = false, text?: string){
        await this.activateBlock(DOM.getLastTopLevelBlock());
        if (this.getActiveRoamNode()?.text || forceCreation) {
            await this.createSiblingBelow();
        }
        if (text) await this.writeText(text);
    },
};

export class RoamNode {
    constructor(readonly text: string, readonly selection: Selection = new Selection(text.length,text.length)) {
    }

    selectedText(): string {
        return this.text.substring(this.selection.start, this.selection.end)
    }
    withCursorAtTheStart() {
        return new RoamNode(
                          this.text,
                          new Selection(0, 0)
                      )
      }
    withCursorAtTheEnd() {
        return new RoamNode(
                          this.text,
                          new Selection(this.text.length, this.text.length)
                      )
      }
}

export class Selection {
    constructor(readonly start: number, readonly end: number) {
    }
}