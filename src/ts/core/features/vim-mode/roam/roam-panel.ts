import {clamp, findLast, last} from 'lodash'

import {Selectors} from 'src/core/roam/selectors'
import {assumeExists} from 'src/core/common/assert'
import {BlockElement, BlockId, RoamBlock} from 'src/core/features/vim-mode/roam/roam-block'

type BlockNavigationState = {
    panelOrder: PanelId[]
    panels: Map<PanelId, RoamPanel>
    focusedPanel: PanelIndex
}

const state: BlockNavigationState = {
    panelOrder: [],
    panels: new Map(),
    focusedPanel: 0,
}

/**
 * Use the actual panel elements as a unique identifier. If this doesn't work,
 * we can tag panel elements with a unique id using css or data attributes
 */
type PanelId = PanelElement
type PanelIndex = number
type PanelElement = HTMLElement

const PANEL_CSS_CLASS = 'roam-toolkit--panel'
const PANEL_SELECTOR = `.${PANEL_CSS_CLASS}, ${Selectors.sidebarContent}`

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
    private readonly element: PanelElement
    /**
     * We persist the block index instead of the block id, because blocks are sometimes
     * deleted before we get a chance to grab another block id. This often happens during cut/paste.
     *
     * Instead, we remember the relative position of the block being selected. This normally
     * throws off your position if many blocks are suddenly inserted before the selected block.
     *
     * In practice however, RoamEvent.onBlurBlock will re-select your block after you stop editing it.
     * This still leads to the selected block being pulled from underneath you during undo/redo however.
     */
    private blockIndex: number

    constructor(element: PanelElement) {
        this.element = element
        this.blockIndex = 0
    }

    private blocks = (): BlockElement[] =>
        Array.from(this.element.querySelectorAll(`${Selectors.block}, ${Selectors.blockInput}`))

    selectedBlock(): RoamBlock {
        const blocks = this.blocks()
        this.blockIndex = clamp(this.blockIndex, 0, blocks.length - 1)
        return new RoamBlock(blocks[this.blockIndex])
    }

    selectBlock(blockId: BlockId) {
        const blocks = this.blocks()
        const blockIndex = blocks.findIndex(({id}) => id === blockId)
        this.selectBlockAt(blockIndex)
    }

    private selectBlockAt(blockIndex: number) {
        this.blockIndex = blockIndex
        this.scrollUntilBlockIsVisible(this.selectedBlock().element)
    }

    selectRelativeBlock(blocksToJump: number) {
        this.selectBlockAt(this.blockIndex + blocksToJump)
    }

    scrollUntilBlockIsVisible(block: BlockElement) {
        this.scroll(blockScrollOverflow(block))
    }

    firstBlock(): BlockElement {
        return assumeExists(this.element.querySelector(Selectors.block) as BlockElement)
    }

    lastBlock(): BlockElement {
        return assumeExists(last(this.blocks()) as BlockElement)
    }

    select() {
        state.focusedPanel = state.panelOrder.indexOf(this.element)
        this.element.scrollIntoView({behavior: 'smooth'})
    }

    static selected(): RoamPanel {
        // Select the next closest panel when closing the last panel
        state.focusedPanel = Math.min(state.focusedPanel, state.panelOrder.length - 1)
        return RoamPanel.get(state.panelOrder[state.focusedPanel])
    }

    static fromBlock(blockElement: BlockElement): RoamPanel {
        return RoamPanel.get(assumeExists(blockElement.closest(PANEL_SELECTOR)) as PanelElement)
    }

    private static at(panelIndex: PanelIndex): RoamPanel {
        panelIndex = clamp(panelIndex, 0, state.panelOrder.length - 1)
        return RoamPanel.get(state.panelOrder[panelIndex])
    }

    static mainPanel(): RoamPanel {
        return RoamPanel.at(0)
    }

    static previousPanel(): RoamPanel {
        return RoamPanel.at(state.focusedPanel - 1)
    }

    static nextPanel(): RoamPanel {
        return RoamPanel.at(state.focusedPanel + 1)
    }

    static updateSidePanels() {
        tagPanels()
        state.panelOrder = Array.from(document.querySelectorAll(PANEL_SELECTOR)) as PanelElement[]
        state.panels = new Map(state.panelOrder.map(id => [id, RoamPanel.get(id)]))
    }

    private static get(panelId: PanelId): RoamPanel {
        // lazily create one if doesn't already exist
        if (!state.panels.has(panelId)) {
            state.panels.set(panelId, new RoamPanel(panelId))
        }
        return assumeExists(state.panels.get(panelId))
    }

    scrollAndReselectBlockToStayVisible(scrollPx: number) {
        this.scroll(scrollPx)
        this.selectClosestVisibleBlock(this.selectedBlock().element)
    }

    private scroll(scrollPx: number) {
        this.element.scrollTop += scrollPx
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
        return assumeExists(this.blocks().find(blockIsVisible), 'Could not find any visible block')
    }

    private lastVisibleBlock() {
        return assumeExists(findLast(this.blocks(), blockIsVisible), 'Could not find any visible block')
    }
}

/**
 * Tag the main panel's parent with css, so panel elements can consistently be accessed
 * using the same selector
 */
const tagPanels = () => {
    const articleElement = assumeExists(document.querySelector(Selectors.mainContent))
    const mainPanel = assumeExists(articleElement.parentElement)
    mainPanel.classList.add(PANEL_CSS_CLASS)
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
