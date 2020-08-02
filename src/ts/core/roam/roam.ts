import {Selectors} from 'src/core/roam/selectors'
import {assumeExists} from 'src/core/common/assert'

import {RoamNode, Selection} from './roam-node'
import {getActiveEditElement, getFirstTopLevelBlock, getInputEvent, getLastTopLevelBlock} from '../common/dom'
import {Keyboard} from '../common/keyboard'
import {Mouse} from '../common/mouse'
import {delay} from 'src/core/common/async'
import {KEY_TO_CODE} from 'src/core/common/keycodes'

export const Roam = {
    async save(roamNode: RoamNode): Promise<void> {
        const roamElement = this.getRoamBlockInput()
        if (roamElement) {
            console.log(`Saving`, roamNode)

            roamElement.value = roamNode.text
            roamElement.dispatchEvent(getInputEvent())

            // Need to select afterwards, otherwise the input event resets the cursor
            await delay(1)
            roamElement.setSelectionRange(roamNode.selection.start, roamNode.selection.end)
        }
    },

    getRoamBlockInput(): HTMLTextAreaElement | null {
        const element = getActiveEditElement()
        if (element?.tagName.toLocaleLowerCase() !== 'textarea') {
            return null
        }
        return element as HTMLTextAreaElement
    },

    getActiveRoamNode(): RoamNode | null {
        const element = this.getRoamBlockInput()
        if (!element) return null

        return new RoamNode(element.value, new Selection(element.selectionStart, element.selectionEnd))
    },

    async applyToCurrent(action: (node: RoamNode) => RoamNode) {
        const node = this.getActiveRoamNode()
        if (!node) return

        await this.save(action(node))
    },

    async highlight(element?: HTMLElement) {
        if (element) {
            await this.activateBlock(element)
        }
        if (this.getRoamBlockInput()) {
            return Keyboard.pressEsc()
        } else {
            return Promise.reject("We're not inside a block")
        }
    },

    async activateBlock(element: HTMLElement) {
        if (element.classList.contains('roam-block')) {
            await Mouse.leftClick(element)
        }
        return this.getRoamBlockInput()
    },

    async deleteBlock() {
        return this.highlight().then(() => Keyboard.pressBackspace())
    },

    async copyBlock() {
        await this.highlight()
        document.execCommand('copy')
    },

    async duplicateBlock() {
        await this.copyBlock()
        await Keyboard.pressEnter()
        await Keyboard.pressEnter()
        document.execCommand('paste')
    },

    async moveCursorToStart() {
        await this.applyToCurrent(node => node.withCursorAtTheStart())
    },

    async moveCursorToEnd() {
        await this.applyToCurrent(node => node.withCursorAtTheEnd())
    },

    async moveCursorToSearchTerm(searchTerm: string) {
        await this.applyToCurrent(node => node.withCursorAtSearchTerm(searchTerm))
    },

    writeText(text: string) {
        this.applyToCurrent(node => new RoamNode(text, node.selection))
        return this.getActiveRoamNode()?.text === text
    },

    appendText(text: string) {
        const existingText = this.getActiveRoamNode()?.text || ''
        return this.writeText(existingText + text)
    },

    async createSiblingAbove() {
        await this.moveCursorToStart()
        const isEmpty = !this.getActiveRoamNode()?.text
        await Keyboard.pressEnter()
        if (isEmpty) {
            await Keyboard.simulateKey(Keyboard.UP_ARROW)
        }
    },

    async createBlockBelow() {
        await this.moveCursorToEnd()
        await Keyboard.pressEnter()
    },

    async createSiblingBelow() {
        await this.createBlockBelow()
        await Keyboard.pressShiftTab(Keyboard.BASE_DELAY)
    },

    async createFirstChild() {
        await this.moveCursorToEnd()
        await Keyboard.pressEnter()
        await Keyboard.pressTab()
    },

    async createLastChild() {
        await this.createSiblingBelow()
        await Keyboard.pressTab()
    },

    async createDeepestLastDescendant() {
        await this.highlight()
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

    async toggleFoldBlock(block: HTMLElement) {
        const foldButton = nearestFoldButton(block)
        await Mouse.hover(foldButton)
        await Mouse.leftClick(foldButton)
    },

    async followLinkUnderCursor(shiftKey: boolean = true) {
        await Keyboard.simulateKey(KEY_TO_CODE.o, 0, {key: 'o', shiftKey, ctrlKey: true})
    },
}

const nearestFoldButton = (element: HTMLElement): HTMLElement => {
    const foldButton = element.querySelector(Selectors.foldButton) as HTMLElement
    if (foldButton) {
        return foldButton
    }
    return nearestFoldButton(assumeExists(element.parentElement))
}
