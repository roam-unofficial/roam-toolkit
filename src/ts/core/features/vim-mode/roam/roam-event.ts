import {BlockElement} from 'src/core/features/vim-mode/roam/roam-block'
import {onSelectorChange, waitForSelectorToExist} from 'src/core/common/mutation-observer'
import {Selectors} from 'src/core/roam/selectors'
import {assumeExists} from 'src/core/common/assert'

type DisconnectFn = () => void

const onBlockEvent = (eventType: string, handler: (element: BlockElement) => void) => {
    const handleBlockEvent = (event: Event) => {
        const element = event.target as BlockElement
        if (element.classList.contains('rm-block-input')) {
            handler(element)
        }
    }
    document.addEventListener(eventType, handleBlockEvent)
    return () => document.removeEventListener(eventType, handleBlockEvent)
}

/**
 * Various helpers for detecting user actions
 *
 * The generically reusable parts of this should probably move to core/roam
 */
export const RoamEvent = {
    // Triggers when the right panel is shown or hidden
    onRightPanelToggle(handler: (isRightPanelOn: boolean) => void): DisconnectFn {
        return onSelectorChange(Selectors.rightPanel, () => {
            if (document.querySelector(Selectors.sidebarContent)) {
                handler(true)
            } else {
                handler(false)
            }
        })
    },

    // Triggers when opening or closing an article in the right panel
    onRightPanelChange(handler: () => void): DisconnectFn {
        let stopObserving = () => {}
        return RoamEvent.onRightPanelToggle(isRightPanelOn => {
            if (isRightPanelOn) {
                stopObserving = onSelectorChange(Selectors.sidebarContent, handler)
            } else {
                stopObserving()
            }
        })
    },

    onFocusBlock(handler: (element: BlockElement) => void): DisconnectFn {
        return onBlockEvent('focusin', handler)
    },

    onBlurBlock(handler: () => void): DisconnectFn {
        return onBlockEvent('focusout', element => {
            // Wait for the text area to transform back into a regular block
            const container = assumeExists(element.closest(Selectors.blockContainer)) as HTMLElement
            waitForSelectorToExist(`${Selectors.block}#${element.id}`, container).then(handler)
        })
    },

    onChangePage(handler: () => void): DisconnectFn {
        // Only the content changes when switching between pages
        let stopObservingContent = onSelectorChange(Selectors.mainContent, handler)
        // The main panel changes when switching between daily notes and regular pages
        let stopObservingMainPanel = onSelectorChange(Selectors.mainPanel, () => {
            handler()
            stopObservingContent()
            stopObservingContent = onSelectorChange(Selectors.mainContent, handler)
        })

        return () => {
            stopObservingContent()
            stopObservingMainPanel()
        }
    },
}
