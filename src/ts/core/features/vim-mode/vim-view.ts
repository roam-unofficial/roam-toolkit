import {Mouse} from 'src/core/common/mouse'
import {isElementVisible} from 'src/core/common/dom'
import {injectStyle} from 'src/core/common/css'
import {Selectors} from 'src/core/roam/selectors'

import {clearVimHints, updateVimHints} from 'src/core/features/vim-mode/hint-view'
import {RoamBlock} from 'src/core/features/vim-mode/roam/roam-block'

/**
 * Runs side effects such as highlighting the selected block,
 * in order to update Roam to reflect Vim Mode's internal state
 */

const BLUR_PIXEL = 'roam-toolkit-block-mode--unfocus-pixel'
const SELECTED_BLOCK_CSS_CLASS = 'roam-toolkit-block-mode--highlight'
injectStyle(
    `
    .${SELECTED_BLOCK_CSS_CLASS} {
        border-radius: 5px;
        background-color: #FFF3E2;
    }
    `,
    'roam-toolkit-block-mode'
)

export const updateVimView = () => {
    const block = RoamBlock.selected().element

    // Roam.activateBlock focuses the textarea, which prevents holding down j/k.
    // Visually fake selection using css instead. Then, lazily focus them during manipulation.
    clearVimView()
    block.classList.add(SELECTED_BLOCK_CSS_CLASS)

    updateVimHints(block)

    viewMoreDailyLogIfPossible()

    return null
}

export const clearVimView = () => {
    const priorSelections = document.querySelectorAll(`.${SELECTED_BLOCK_CSS_CLASS}`)
    priorSelections.forEach(selection => selection.classList.remove(SELECTED_BLOCK_CSS_CLASS))
    clearVimHints()
}

const viewMoreDailyLogIfPossible = () => {
    const viewMore = document.querySelector(Selectors.viewMore)
    if (isElementVisible(viewMore)) {
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
