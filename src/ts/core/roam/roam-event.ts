import {BlockElement} from 'src/core/features/vim-mode/roam/roam-block'
import {DisconnectFn, onSelectorChange, waitForSelectorToExist} from 'src/core/common/mutation-observer'
import {Selectors} from 'src/core/roam/selectors'
import {assumeExists} from 'src/core/common/assert'
import {listenToEvent} from 'src/core/common/event'
import {delay} from 'src/core/common/async'

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
        let _stopObservingInside: DisconnectFn | null = null
        const observeSidebarPages = () => {
            if (isSidebarShowing()) {
                _stopObservingInside = _stopObservingInside || onSelectorChange(Selectors.sidebarContent, handler)
            } else {
                stopObservingInside()
            }
        }
        const stopObservingInside = () => {
            if (_stopObservingInside) {
                _stopObservingInside()
                _stopObservingInside = null
            }
        }
        // Start watching, if the sidebar is already open
        observeSidebarPages()
        const stopObserving = RoamEvent.onSidebarToggle(observeSidebarPages)
        return () => {
            stopObserving()
            stopObservingInside()
        }
    },

    onFoldBlock(handler: () => void): DisconnectFn {
        return listenToEvent('click', async (event: Event) => {
            const element = event.target as HTMLElement
            if (element.classList.contains('rm-caret')) {
                // resize panels after folding. folding sometimes takes a while
                await delay(100)
                handler()
            }
        })
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

    onRenamePage(handler: (renameTextArea: string) => void): DisconnectFn {
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
        let stopObservingContent = () => {}
        const reobserveContent = () => {
            stopObservingContent()
            stopObservingContent = onSelectorChange(Selectors.mainContent, handler)
        }
        // The main panel changes when switching between daily notes and regular pages
        let stopObservingMain = () => {}
        const reobserveMain = () => {
            stopObservingMain()
            stopObservingMain = onSelectorChange(Selectors.main, () => {
                reobserveContent()
                handler()
            })
        }

        reobserveContent()
        reobserveMain()

        return () => {
            stopObservingContent()
            stopObservingMain()
        }
    },
}
