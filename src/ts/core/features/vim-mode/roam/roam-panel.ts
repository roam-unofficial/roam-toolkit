import {clamp, findLast, last} from 'lodash'

import {Selectors} from 'src/core/roam/selectors'
import {assumeExists} from 'src/core/common/assert'
import {BlockElement, BlockId, RoamBlock} from 'src/core/features/vim-mode/roam/roam-block'
import {relativeItem} from 'src/core/common/array'

type BlockNavigationState = {
    panelOrder: Array<PanelId>
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
    private _selectedBlockId: BlockId | null

    constructor(element: PanelElement) {
        this.element = element
        this._selectedBlockId = null
    }

    private blocks = (): BlockElement[] => Array.from(this.element.querySelectorAll(Selectors.block))

    private relativeBlockId(blockId: BlockId, blocksToJump: number): BlockId {
        const blocks = this.blocks()
        const blockIndex = blocks.findIndex(({id}) => id === blockId)
        return relativeItem(blocks, blockIndex, blocksToJump).id
    }

    get selectedBlockId(): BlockId {
        if (!this._selectedBlockId || !document.getElementById(this._selectedBlockId)) {
            // Fallback to selecting the first block,
            // if blockId is not initialized yet, or the block no longer exists
            const firstBlockId = this.firstBlock().id
            this.selectBlock(firstBlockId)
            return firstBlockId
        }

        return this._selectedBlockId
    }

    selectedBlock(): RoamBlock {
        return RoamBlock.get(this.selectedBlockId)
    }

    selectBlock(blockId: string) {
        this._selectedBlockId = blockId
        this.scrollUntilBlockIsVisible(this.selectedBlock().element)
    }

    selectRelativeBlock(blocksToJump: number) {
        const block = this.selectedBlock().element
        this.selectBlock(this.relativeBlockId(block.id, blocksToJump))
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
