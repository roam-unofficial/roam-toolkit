import {Selectors} from 'SRC/core/roam/selectors'
import {assumeExists} from 'SRC/core/common/assert'
import {RoamBlock, BlockElement, BlockId} from 'SRC/core/features/vim-mode/roam/roam-block'
import {findLast, relativeItem} from 'SRC/core/common/array'

type BlockNavigationState = {
    panels: Map<PanelId, BlockId | null>
    focusedPanel: PanelId
}

const state: BlockNavigationState = {
    panels: new Map([
        ['MAIN', null],
        ['SIDE', null],
    ]),
    focusedPanel: 'MAIN',
}

export type PanelId = 'MAIN' | 'SIDE'

type PanelElement = HTMLElement

/**
 * A "Panel" is a viewport that contains blocks. For now, there is just
 * the Main panel and the Right panel. It is analogous a vim window
 *
 * In the future, each page in the right panel could be controlled as it's
 * own "panel", which might be useful for Matsuchak/Masonry mode
 *
 * The generically reusable parts of this should probably move to core/roam
 */
export class RoamPanel {
    private readonly panelId: PanelId

    constructor(panelId: PanelId) {
        this.panelId = panelId
    }

    private blocks = (): BlockElement[] => Array.from(this.element().querySelectorAll(Selectors.block))

    private relativeBlockId(blockId: BlockId, blocksToJump: number): BlockId {
        const blocks = this.blocks()
        const blockIndex = blocks.findIndex(({id}) => id === blockId)
        return relativeItem(blocks, blockIndex, blocksToJump).id
    }

    selectedBlockId(): BlockId {
        const blockId = state.panels.get(this.panelId)

        if (!blockId || !document.getElementById(blockId)) {
            // Fallback to selecting the first block,
            // if blockId is not initialized yet, or the block no longer exists
            const firstBlockId = this.firstBlockId()
            this.selectBlock(firstBlockId)
            return firstBlockId
        }

        return blockId
    }

    selectedBlock(): RoamBlock {
        return RoamBlock.get(this.selectedBlockId())
    }

    selectBlock(blockId: string) {
        state.panels.set(this.panelId, blockId)
    }

    selectRelativeBlock(blocksToJump: number) {
        const block = this.selectedBlock().element()
        this.selectBlock(this.relativeBlockId(block.id, blocksToJump))
        this.scrollUntilBlockIsVisible(block)
    }

    scrollUntilBlockIsVisible(block: BlockElement) {
        this.scroll(blockScrollOverflow(block))
    }

    element(): PanelElement {
        if (this.panelId === 'SIDE') {
            return assumeExists(document.querySelector(Selectors.sidebarContent) as HTMLElement)
        } else {
            const articleElement = assumeExists(document.querySelector(Selectors.mainContent))
            return assumeExists(articleElement.parentElement)
        }
    }

    firstBlockId(): BlockId {
        return assumeExists(this.element().querySelector(Selectors.block)).id
    }

    static get(panelId: PanelId): RoamPanel {
        return new RoamPanel(panelId)
    }

    static selected(): RoamPanel {
        return this.get(state.focusedPanel)
    }

    static select(panelId: PanelId) {
        state.focusedPanel = panelId
    }

    scrollAndReselectBlockToStayVisible(scrollPx: number) {
        this.scroll(scrollPx)
        this.selectClosestVisibleBlock(this.selectedBlock().element())
    }

    private scroll(scrollPx: number) {
        this.element().scrollTop += scrollPx
    }

    private selectClosestVisibleBlock(block: BlockElement) {
        const scrollOverflow = blockScrollOverflow(block)
        if (scrollOverflow < 0) {
            // Block has gone out of bounds off the top
            this.selectBlock(this.firstVisibleBlock().id)
        }
        if (scrollOverflow > 0) {
            // Block has gone out of bounds off the bottom
            this.selectBlock(this.lastVisibleBlock().id)
        }
    }

    private firstVisibleBlock(): BlockElement {
        const blocks = this.blocks()
        return assumeExists(blocks.find(blockIsVisible), 'Could not find any visible block')
    }

    private lastVisibleBlock() {
        const blocks = this.blocks()
        return assumeExists(findLast(blocks, blockIsVisible), 'Could not find any visible block')
    }
}

// Roughly two lines on either side
const SCROLL_PADDING_TOP = 100
const SCROLL_PADDING_BOTTOM = 60

/**
 * If a block is:
 * - too far above the viewport, this will be negative
 * - too far below the viewport, this will be positive
 * - visible, this will be 0
 */
const blockScrollOverflow = (block: BlockElement): number => {
    const {top, height} = block.getBoundingClientRect()

    const overflowTop = SCROLL_PADDING_TOP - top
    if (overflowTop > 0) {
        return -overflowTop
    }

    const overflowBottom = top + height + SCROLL_PADDING_BOTTOM - window.innerHeight
    if (overflowBottom > 0) {
        return overflowBottom
    }

    return 0
}

const blockIsVisible = (block: BlockElement): boolean => blockScrollOverflow(block) === 0
