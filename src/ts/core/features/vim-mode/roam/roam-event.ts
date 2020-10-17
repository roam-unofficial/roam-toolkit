import {BlockElement} from 'src/core/features/vim-mode/roam/roam-block'
import {DisconnectFn, onSelectorChange, waitForSelectorToExist} from 'src/core/common/mutation-observer'
import {Selectors} from 'src/core/roam/selectors'
import {assumeExists} from 'src/core/common/assert'

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

const isSidebarShowing = () => !!document.querySelector(Selectors.sidebarContent)

/**
 * Various helpers for detecting user actions
 *
 * The generically reusable parts of this should probably move to core/roam
 */
export const RoamEvent = {
    // Triggers when the sidebar is shown or hidden
    onSidebarToggle(handler: (isSideBarShowing: boolean) => void): DisconnectFn {
        return onSelectorChange(Selectors.sidebar, () => {
            handler(isSidebarShowing())
        })
    },

    // Triggers when opening or closing an article in the sidebar
    onSidebarChange(handler: () => void): DisconnectFn {
        let stopObserving: DisconnectFn | null = null
        const observeSidebarPanels = () => {
            if (isSidebarShowing() && !stopObserving) {
                stopObserving = onSelectorChange(Selectors.sidebarContent, () => {
                    handler()
                })
            } else if (stopObserving) {
                stopObserving()
                stopObserving = null
            }
        }
        // Start watching, if the sidebar is already open
        observeSidebarPanels()
        return RoamEvent.onSidebarToggle(observeSidebarPanels)
    },

    onEditBlock(handler: (element: BlockElement) => void): DisconnectFn {
        return onBlockEvent('focusin', handler)
    },

    onChangeBlock(handler: (element: BlockElement) => void): DisconnectFn {
        return onBlockEvent('input', handler)
    },

    onBlurBlock(handler: (element: BlockElement) => void): DisconnectFn {
        return onBlockEvent('focusout', element => {
            // Wait for the text area to transform back into a regular block
            const container = assumeExists(element.closest(Selectors.blockContainer)) as HTMLElement
            waitForSelectorToExist(`${Selectors.block}#${Selectors.escapeHtmlId(element.id)}`, container).then(handler)
        })
    },

    onRenamePage(handler: (newTitle: string) => void): DisconnectFn {
        const handleTitleEvent = (event: Event) => {
            const element = event.target as HTMLTextAreaElement
            if (element.classList.contains('rm-title-textarea')) {
                handler(element.value)
            }
        }
        document.addEventListener('focusout', handleTitleEvent)
        return () => document.removeEventListener('focusout', handleTitleEvent)
    },

    onChangePage(handler: () => void): DisconnectFn {
        // Only the content changes when switching between pages
        let stopObservingContent = onSelectorChange(Selectors.mainContent, handler)
        // The main panel changes when switching between daily notes and regular pages
        const stopObservingMainPanel = onSelectorChange(
            Selectors.mainPanel,
            () => {
                handler()
                stopObservingContent()
                stopObservingContent = onSelectorChange(Selectors.mainContent, handler)
            },
            false,
            false // avoid detecting spatial graph mode transforms
        )

        return () => {
            stopObservingContent()
            stopObservingMainPanel()
        }
    },
}
