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

export const getFocusedPanel = (): Element => {
    if (state.panel === 'MAIN') {
        const articleElement = assumeExists(document.querySelector(Selectors.mainPanel))
        return assumeExists(articleElement.parentElement);
    }
    if (state.panel === 'SIDEBAR') {
        return assumeExists(document.querySelector(Selectors.rightPanel))
    }
    throw new Error(`Unexpected panel ${state.panel}`)
}

const firstBlockInPanel = () => assumeExists(getFocusedPanel().querySelector(Selectors.block), `Panel doesn't have any blocks`)

const blockIdRelative = (blockId: string | null, blocksToJump: number, panel: Element): string => {
    const block = getBlock(blockId)
    if (!block) {
        // Select the first block by default, if no block is selected yet,
        return firstBlockInPanel().id
    }
    const blocks = panel.querySelectorAll(Selectors.block)

    let blockIndex
    // @ts-ignore NodeList.entries() does exist in Chrome/FF:
    // https://developer.mozilla.org/en-US/docs/Web/API/NodeList/entries
    for (let [i, block] of blocks.entries()) {
        if (block.id === blockId) {
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

export const jumpBlocksInFocusedPanel = (blocksToJump: number) => {
    setSelectedBlockId(blockIdRelative(selectedBlockId(), blocksToJump, getFocusedPanel()))
}

export const getBlock = (blockId: string | null): Element | null => {
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

export const selectedBlock = (): Element | null => getBlock(selectedBlockId())

export const setSelectedBlockId = (blockId: string) => {
    if (state.panel === 'MAIN') {
        state.mainBlockId = blockId
    } else if (state.panel === 'SIDEBAR') {
        state.sideBlockId = blockId
    } else {
        throw new Error(`Unrecognized Panel ${state.panel}`)
    }
}

export const selectedBlockId = (): string | null => (state.panel === 'MAIN' ? state.mainBlockId : state.sideBlockId)
