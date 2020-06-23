import {assumeExists} from 'SRC/core/common/assert'
import {RoamPanel} from 'SRC/core/features/vim-mode/roam/roam-panel'
import {Roam} from 'SRC/core/roam/roam'

export type BlockId = string
export type BlockElement = HTMLElement

/**
 * The generically reusable parts of this should probably move to core/roam
 */
export class RoamBlock {
    private blockId: BlockId

    constructor(blockId: BlockId) {
        this.blockId = blockId
    }

    element(): BlockElement {
        return assumeExists(document.getElementById(this.blockId))
    }

    async focus() {
        await Roam.activateBlock(this.element())
    }

    async toggleFold() {
        await Roam.toggleFoldBlock(this.element())
    }

    static get(blockId: BlockId): RoamBlock {
        return new RoamBlock(blockId)
    }

    static selected(): RoamBlock {
        return RoamPanel.selected().selectedBlock()
    }
}