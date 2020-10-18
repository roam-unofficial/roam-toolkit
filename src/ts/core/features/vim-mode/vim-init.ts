import {DisconnectFn, waitForSelectorToExist} from 'src/core/common/mutation-observer'
import {Selectors} from 'src/core/roam/selectors'
import {delay} from 'src/core/common/async'

import {clearVimView, updateVimView} from 'src/core/features/vim-mode/vim-view'
import {VimRoamPanel} from 'src/core/features/vim-mode/roam/roam-vim-panel'
import {RoamEvent} from 'src/core/features/vim-mode/roam/roam-event'

let disconnectHandlers: DisconnectFn[] = []

/**
 * Listens to various events like mouse clicks and panel toggling,
 * in order to synchronize Vim Mode's internal state.
 */
export const startVimMode = async () => {
    await waitForSelectorToExist(Selectors.mainContent)
    // Wait for roam to finish setting classes on the block, to
    // avoid classes getting clobbered
    await delay(300)

    disconnectHandlers = [
        // Select block when clicked
        RoamEvent.onEditBlock(blockElement => {
            VimRoamPanel.fromBlock(blockElement).select()
            VimRoamPanel.selected().selectBlock(blockElement.id)
            updateVimView()
        }),

        // Re-select block after the text area returns to being a regular block
        RoamEvent.onBlurBlock(updateVimView),

        // Re-select main panel block after the closing right panel
        RoamEvent.onSidebarToggle(isRightPanelOn => {
            if (!isRightPanelOn) {
                VimRoamPanel.mainPanel().select()
            }
            VimRoamPanel.updateSidePanels()
            updateVimView()
        }),

        // Select first block in right panel when closing pages in right panel
        RoamEvent.onSidebarChange(() => {
            VimRoamPanel.updateSidePanels()
            updateVimView()
        }),

        // Select first block when switching pages
        RoamEvent.onChangePage(() => {
            VimRoamPanel.updateSidePanels()
            VimRoamPanel.mainPanel().selectFirstBlock()
            updateVimView()
        }),
    ]

    VimRoamPanel.updateSidePanels()
    updateVimView()
}

export const stopVimMode = () => {
    disconnectHandlers.forEach(disconnect => disconnect())
    disconnectHandlers = []
    clearVimView()
}

export const isVimModeOn = () => disconnectHandlers.length > 0
