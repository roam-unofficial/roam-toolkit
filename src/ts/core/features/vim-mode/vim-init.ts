import {waitForSelectorToExist} from 'src/core/common/mutation-observer'
import {Selectors} from 'src/core/roam/selectors'
import {delay} from 'src/core/common/async'

import {updateBlockNavigationView} from 'src/core/features/vim-mode/vim-view'
import {RoamPanel} from 'src/core/features/vim-mode/roam/roam-panel'
import {RoamEvent} from 'src/core/features/vim-mode/roam/roam-event'


/**
 * Listens to various events like mouse clicks and panel toggling,
 * in order to synchronize Vim Mode's internal state.
 */
export const initializeBlockNavigationMode = async () => {
    await waitForSelectorToExist(Selectors.mainContent)
    // Wait for roam to finish setting classes on the block, to
    // avoid classes getting clobbered
    await delay(300)

    // Select block when clicked
    RoamEvent.onFocusBlock(blockElement => {
        RoamPanel.select(blockElement.closest(Selectors.mainContent) ? 'MAIN' : 'SIDE')
        RoamPanel.selected().selectBlock(blockElement.id)
        updateBlockNavigationView()
    })

    // Re-select block after the text area returns to being a regular block
    RoamEvent.onBlurBlock(updateBlockNavigationView)

    // Re-select main panel block after the closing right panel
    RoamEvent.onRightPanelToggle(isRightPanelOn => {
        if (!isRightPanelOn) {
            RoamPanel.select('MAIN')
        }
        updateBlockNavigationView()
    })
    // Select first block in right panel when closing pages in right panel
    RoamEvent.onRightPanelChange(updateBlockNavigationView)

    // Select first block when switching pages
    RoamEvent.onChangePage(updateBlockNavigationView)

    updateBlockNavigationView()
}
