import {Selectors} from '../../roam/roam-selectors'
import {getFocusedPanel, jumpBlocksInFocusedPanel, selectedBlock, state} from './blockNavigation'
import {injectStyle} from '../../scripts/dom'
import {Mouse} from '../../utils/mouse'
import {clearHints, updateBlockNavigationHintView} from './blockNavigationHintView'

const isElementVisible = (element: Element) => {
    const {x, y} = element.getBoundingClientRect()
    return x >= 0 && y >= 0 && x <= window.innerWidth && y <= window.innerHeight
}

const BLUR_PIXEL = 'roam-toolkit-block-mode--unfocus-pixel'
const HIGHLIGHT_CSS_CLASS = 'roam-toolkit-block-mode--highlight'
injectStyle(
    `
    #${BLUR_PIXEL} {
        position: absolute;
        top: 0;
        right: 0;
        width: 1px;
        height: 1px;
        background-color: rgba(0,0,0,0); 
    }
    .${HIGHLIGHT_CSS_CLASS} {
        background-color: wheat; 
    }
    `,
    'roam-toolkit-block-mode'
)

export const clearBlockNavigationView = () => {
    clearHighlights();
    clearHints();
}

export const updateBlockNavigationView = () => {
    const {mainBlockId, sideBlockId, panel} = state

    const blockId = panel === 'MAIN' ? mainBlockId : sideBlockId
    const block = blockId && document.getElementById(blockId)

    if (!block) {
        return
    }

    // Roam.activateBlock focuses the textarea, which prevents holding down j/k.
    // Visually fake selection using css instead. Then, lazily focus them during manipulation.
    clearHighlights()
    block.classList.add(HIGHLIGHT_CSS_CLASS)

    updateBlockNavigationHintView(block);

    viewMoreDailyLogIfPossible()

    return null
}

const clearHighlights = () => {
    const priorSelections = document.querySelectorAll(`.${HIGHLIGHT_CSS_CLASS}`)
    if (priorSelections.length > 0) {
        priorSelections.forEach(selection => selection.classList.remove(HIGHLIGHT_CSS_CLASS))
    }
}

const SCROLL_PADDING_TOP = 100
const SCROLL_PADDING_BOTTOM = 100

export const scrollUntilBlockIsVisible = (block: HTMLElement | null = null) => {
    scrollFocusedPanel(blockScrollNeededToBeVisible(block))
}

export const jumpUntilSelectedBlockIsVisible = () => {
    // positive blockScrollNeededToBeVisible means
    jumpUntilBlockIsVisible(-Math.sign(blockScrollNeededToBeVisible()))
}

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

const viewMoreDailyLogIfPossible = () => {
    const viewMore = document.querySelector(Selectors.viewMore)
    if (viewMore && isElementVisible(viewMore)) {
        Mouse.hover(viewMore as HTMLElement)
    }
}

export const blurEverything = () => {
    // Clicking a different element also clears popups
    let blurPixel = document.getElementById(BLUR_PIXEL)
    if (!blurPixel) {
        blurPixel = document.createElement('div')
        blurPixel.id = BLUR_PIXEL
        document.body.appendChild(blurPixel)
    }
    Mouse.leftClick(blurPixel as HTMLElement)
}
