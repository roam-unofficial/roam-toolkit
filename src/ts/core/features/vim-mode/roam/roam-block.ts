import {assumeExists} from 'src/core/common/assert'
import {RoamPanel} from 'src/core/features/vim-mode/roam/roam-panel'
import {Roam} from 'src/core/roam/roam'

export type BlockId = string
export type BlockElement = HTMLElement

/**
 * The generically reusable parts of this should probably move to core/roam
 */
export class RoamBlock {
    element: BlockElement

    constructor(element: BlockElement) {
        this.element = element
    }

    get id(): string {
        return this.element.id
    }

    async edit() {
        await Roam.activateBlock(this.element)
    }

    async toggleFold() {
        await Roam.toggleFoldBlock(this.element)
    }

    static get(blockId: BlockId): RoamBlock {
        return new RoamBlock(assumeExists(document.getElementById(blockId)))
    }

    static selected(): RoamBlock {
        return RoamPanel.selected().selectedBlock()
    }
}
