import {Selectors} from '../../roam/roam-selectors'
import {state} from './blockNavigation'
import {injectStyle} from '../../scripts/dom'
import {Mouse} from '../../utils/mouse'
import {clearHints, updateBlockNavigationHintView} from './blockNavigationHintView'
import {isElementVisible} from '../../utils/dom'

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
