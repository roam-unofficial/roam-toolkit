import {assumeExists} from '../../utils/assert'
import {Selectors} from '../../roam/roam-selectors'

export type Panel = 'MAIN' | 'SIDEBAR'

type State = {
    mainBlockId: string | null
    sideBlockId: string | null
    panel: Panel
}

export const state: State = {
    mainBlockId: null,
    sideBlockId: null,
    panel: 'MAIN',
}

export const getFocusedPanel = (): HTMLElement => {
    if (state.panel === 'MAIN') {
        const articleElement = assumeExists(document.querySelector(Selectors.mainContent))
        return assumeExists(articleElement.parentElement)
    }
    if (state.panel === 'SIDEBAR') {
        return assumeExists(document.querySelector(Selectors.sidebarContent))
    }
    throw new Error(`Unexpected panel ${state.panel}`)
}

const getPanel = (panel?: Panel): HTMLElement | null => {
    if (!panel) {
        return getFocusedPanel()
    }
    return panel === 'MAIN' ? mainPanel() : rightPanel()
}

const rightPanel = (): HTMLElement | null => document.querySelector(Selectors.sidebarContent)

const mainPanel = (): HTMLElement | null => document.querySelector(Selectors.mainContent)?.parentElement || null

export const ensureMainPanelHasBlockSelected = () => {
    if (!getBlock(state.mainBlockId)) {
        const mainPanel = assumeExists(getPanel('MAIN'))
        state.mainBlockId = mainPanel.querySelector(Selectors.block)?.id || null
    }
}

export const ensureRightPanelHasBlockSelected = () => {
    const rightPanel = getPanel('SIDEBAR')
    if (rightPanel && !getBlock(state.sideBlockId)) {
        state.sideBlockId = rightPanel.querySelector(Selectors.block)?.id || null
    }
}

export const ensureFocusedPanelHasBlockSelected = () => {
    if (state.panel === 'MAIN') {
        ensureMainPanelHasBlockSelected()
    } else {
        ensureRightPanelHasBlockSelected()
    }
}

const blockIdRelative = (block: HTMLElement, blocksToJump: number, panel: Element): string => {
    const blocks = panel.querySelectorAll(Selectors.block)

    let blockIndex
    // @ts-ignore NodeList.entries() does exist in Chrome/FF:
    // https://developer.mozilla.org/en-US/docs/Web/API/NodeList/entries
    for (let [i, _block] of blocks.entries()) {
        if (_block.id === block.id) {
            blockIndex = i
            break
        }
    }

    let destinationBlockIndex
    if (Math.sign(blocksToJump) > 0) {
        destinationBlockIndex = Math.min(blockIndex + blocksToJump, blocks.length - 1)
    } else {
        destinationBlockIndex = Math.max(0, blockIndex + blocksToJump)
    }

    return blocks[destinationBlockIndex].id
}

export const firstNativelyHighlightedBlock = (): HTMLElement | null => {
    const blocks = document.querySelectorAll(`${Selectors.highlight} ${Selectors.block}`)
    return (blocks[0] as HTMLElement) || null;
}

export const lastNativelyHighlightedBlock = (): HTMLElement | null => {
    const blocks = document.querySelectorAll(`${Selectors.highlight} ${Selectors.block}`)
    return (blocks[blocks.length - 1] as HTMLElement) || null;
}

export const jumpBlocksInFocusedPanel = (blocksToJump: number) => {
    const block = assumeExists(selectedBlock(), 'blocks should be focused as soon as the first block becomes visible')
    setSelectedBlockId(blockIdRelative(block, blocksToJump, getFocusedPanel()))
}

export const getBlock = (blockId: string | null): HTMLElement | null => {
    if (!blockId) {
        return null
    }

    const block = document.getElementById(blockId)
    if (!block) {
        // The block may no longer exists after navigating to a different page
        return null
    }

    return block
}

export const selectedBlock = (): HTMLElement | null => getBlock(selectedBlockId())

export const setSelectedBlockId = (blockId: string, panel?: Panel) => {
    panel = panel || state.panel
    if (panel === 'MAIN') {
        state.mainBlockId = blockId
    } else if (panel === 'SIDEBAR') {
        state.sideBlockId = blockId
    } else {
        throw new Error(`Unrecognized Panel ${state.panel}`)
    }
}

export const selectedBlockId = (): string =>
    assumeExists(
        state.panel === 'MAIN' ? state.mainBlockId : state.sideBlockId,
        'blocks should be focused as soon as the first block becomes visible'
    )

// Roughly two lines on either side
// top padding is more, to account for top bar
const SCROLL_PADDING_TOP = 100
const SCROLL_PADDING_BOTTOM = 60

export const scrollUntilBlockIsVisible = (block: HTMLElement | null = null) => {
    scrollFocusedPanel(blockScrollNeededToBeVisible(block))
}

export const jumpUntilSelectedBlockIsVisible = () =>
    jumpUntilBlockIsVisible(-Math.sign(blockScrollNeededToBeVisible()))

const blockScrollNeededToBeVisible = (block: HTMLElement | null = null): number => {
    block = block || selectedBlock()
    if (!block) {
        return 0
    }

    const {top, height} = block.getBoundingClientRect()
    // Overflow top
    const overflowTop = SCROLL_PADDING_TOP - top
    if (overflowTop > 0) {
        return -overflowTop
    }
    // Overflow bottom
    const overflowBottom = top + height + SCROLL_PADDING_BOTTOM - window.innerHeight
    if (overflowBottom > 0) {
        return overflowBottom
    }

    return 0
}

const MAX_JUMPS_BEFORE_GIVING_UP = 10

const jumpUntilBlockIsVisible = (stepSize: number) => {
    for (let i = 0; i < MAX_JUMPS_BEFORE_GIVING_UP; i++) {
        jumpBlocksInFocusedPanel(stepSize)
        if (blockScrollNeededToBeVisible() === 0) {
            return
        }
    }
}

export const scrollFocusedPanel = (scrollPx: number) => (getFocusedPanel().scrollTop += scrollPx)