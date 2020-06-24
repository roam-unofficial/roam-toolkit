import {clamp, findLast, last} from 'lodash'

import {Selectors} from 'src/core/roam/selectors'
import {assumeExists} from 'src/core/common/assert'
import {BlockElement, BlockId, RoamBlock} from 'src/core/features/vim-mode/roam/roam-block'
import {relativeItem} from 'src/core/common/array'

type BlockNavigationState = {
    panelOrder: PanelId[]
    panels: Map<PanelId, RoamPanel>
    focusedPanel: PanelIndex
    lastFocusedSidebarPanel: PanelIndex
    previouslySelectedBlocks: Set<BlockId>
}

const state: BlockNavigationState = {
    panelOrder: [],
    panels: new Map(),
    focusedPanel: 0,
    lastFocusedSidebarPanel: 1,
    previouslySelectedBlocks: new Set(),
}

/**
 * Use the actual panel elements as a unique identifier. If this doesn't work,
 * we can tag panel elements with a unique id using css or data attributes
 */
type PanelId = PanelElement
type PanelIndex = number
type PanelElement = HTMLElement

const PANEL_CSS_CLASS = 'roam-toolkit--panel'
const PANEL_SELECTOR = `.${PANEL_CSS_CLASS}, ${Selectors.sidebarPage}`

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
    private _selectedBlockId: BlockId | null
    /**
     * We persist the block index in addition to block id, because blocks are sometimes
     * deleted before we get a chance to grab another block id. This often happens during cut/paste.
     *
     * We don't use the blockIndex as the source of truth though, to avoid the blocks being pulled
     * from under the selection like a rug.
     */
    private blockIndex: number

    constructor(element: PanelElement) {
        this.element = element
        this._selectedBlockId = null
        this.blockIndex = 0
    }

    private blocks = (): BlockElement[] =>
        Array.from(this.element.querySelectorAll(`${Selectors.block}, ${Selectors.blockInput}`))

    private relativeBlockId(blockId: BlockId, blocksToJump: number): BlockId {
        return relativeItem(this.blocks(), this.indexOf(blockId), blocksToJump).id
    }

    private indexOf(blockId: BlockId): number {
        return this.blocks().findIndex(({id}) => id === blockId)
    }

    get selectedBlockId(): BlockId {
        if (!this._selectedBlockId || !document.getElementById(this._selectedBlockId)) {
            // Fallback to the the position of the last selected block
            const blocks = this.blocks()
            this.blockIndex = clamp(this.blockIndex, 0, blocks.length - 1)
            this.selectBlock(blocks[this.blockIndex].id)
        }

        return this._selectedBlockId!
    }

    selectedBlock(): RoamBlock {
        return RoamBlock.get(this.selectedBlockId)
    }

    selectBlock(blockId: BlockId) {
        this._selectedBlockId = blockId
        this.blockIndex = this.indexOf(blockId)
        this.scrollUntilBlockIsVisible(this.selectedBlock().element)
    }

    selectRelativeBlock(blocksToJump: number) {
        const block = this.selectedBlock().element
        this.selectBlock(this.relativeBlockId(block.id, blocksToJump))
    }

    selectFirstBlock() {
        this.selectBlock(this.firstBlock().id)
    }

    selectLastBlock() {
        this.selectBlock(this.lastBlock().id)
    }

    selectLastVisibleBlock() {
        this.selectBlock(this.lastVisibleBlock().id)
    }

    selectFirstVisibleBlock() {
        this.selectBlock(this.firstVisibleBlock().id)
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
        if (state.focusedPanel > 0) {
            state.lastFocusedSidebarPanel = state.focusedPanel
        }
        state.focusedPanel = state.panelOrder.indexOf(this.element)
        this.element.scrollIntoView({
            inline: 'end',
        })
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

    static previousSidebarPanel(): RoamPanel {
        return RoamPanel.at(state.lastFocusedSidebarPanel)
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
            const panel = new RoamPanel(panelId)
            state.panels.set(panelId, panel)
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
            this.selectFirstVisibleBlock()
        }
        if (scrollOverflow > 0) {
            // Block has gone out of bounds off the bottom
            this.selectLastVisibleBlock()
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
