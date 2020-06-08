import {RoamNode, Selection} from './roam-node'
import {getActiveEditElement, getFirstTopLevelBlock, getInputEvent, getLastTopLevelBlock} from '../common/dom'
import {Keyboard} from '../common/keyboard'
import {Mouse} from '../common/mouse'

export const Roam = {
    save(roamNode: RoamNode) {
        const roamElement = this.getRoamBlockInput()
        if (roamElement) {
            console.log(`Saving`, roamNode)

            roamElement.value = roamNode.text
            roamElement.selectionStart = roamNode.selection.start
            roamElement.selectionEnd = roamNode.selection.end

            roamElement.dispatchEvent(getInputEvent())
        }
    },

    getRoamBlockInput(): HTMLTextAreaElement | null {
        const element = getActiveEditElement()
        if (element.tagName.toLocaleLowerCase() !== 'textarea') {
            return null
        }
        return element as HTMLTextAreaElement
    },

    getActiveRoamNode(): RoamNode | null {
        const element = this.getRoamBlockInput()
        if (!element) return null

        return new RoamNode(element.value, new Selection(element.selectionStart, element.selectionEnd))
    },

    applyToCurrent(action: (node: RoamNode) => RoamNode) {
        const node = this.getActiveRoamNode()
        if (!node) return

        this.save(action(node))
    },

    async selectBlock() {
        if (this.getRoamBlockInput()) {
            return Keyboard.pressEsc()
        }
        return Promise.reject("We're currently not inside roam block")
    },

    async activateBlock(element: HTMLElement) {
        if (element.classList.contains('roam-block')) {
            await Mouse.leftClick(element)
        }
        return this.getRoamBlockInput()
    },

    async deleteBlock() {
        return this.selectBlock().then(() => Keyboard.pressBackspace())
    },

    async copyBlock() {
        await this.selectBlock()
        document.execCommand('copy')
    },

    async duplicateBlock() {
        await this.copyBlock()
        await Keyboard.pressEnter()
        await Keyboard.pressEnter()
        document.execCommand('paste')
    },

    moveCursorToStart() {
        this.applyToCurrent(node => node.withCursorAtTheStart())
    },

    moveCursorToEnd() {
        this.applyToCurrent(node => node.withCursorAtTheEnd())
    },

    writeText(text: string) {
        this.applyToCurrent(node => new RoamNode(text, node.selection))
        return this.getActiveRoamNode()?.text === text
    },

    async createSiblingAbove() {
        this.moveCursorToStart()
        const isEmpty = !this.getActiveRoamNode()?.text
        await Keyboard.pressEnter()
        if (isEmpty) {
            await Keyboard.simulateKey(Keyboard.UP_ARROW)
        }
    },

    async createSiblingBelow() {
        this.moveCursorToEnd()
        await Keyboard.pressEnter()
        await Keyboard.pressShiftTab(Keyboard.BASE_DELAY)
    },

    async createFirstChild() {
        this.moveCursorToEnd()
        await Keyboard.pressEnter()
        await Keyboard.pressTab()
    },

    async createLastChild() {
        await this.createSiblingBelow()
        await Keyboard.pressTab()
    },

    async createDeepestLastDescendant() {
        await this.selectBlock()
        await Keyboard.simulateKey(Keyboard.RIGHT_ARROW)
        await Keyboard.pressEnter()
    },

    async createBlockAtTop(forceCreation: boolean = false) {
        await this.activateBlock(getFirstTopLevelBlock())
        if (this.getActiveRoamNode()?.text || forceCreation) {
            await this.createSiblingAbove()
        }
    },

    async createBlockAtBottom(forceCreation: boolean = false) {
        await this.activateBlock(getLastTopLevelBlock())
        if (this.getActiveRoamNode()?.text || forceCreation) {
            await this.createSiblingBelow()
        }
    },

    getCurrentBlockUid(): string | undefined {
        // An empirical observation:
        const uidLength = 9
        const elementId = Roam.getRoamBlockInput()?.id
        return elementId?.substr(elementId?.length - uidLength)
    },
}
