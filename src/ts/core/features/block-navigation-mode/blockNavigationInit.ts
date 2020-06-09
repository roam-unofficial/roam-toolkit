import {onSelectorChange, waitForSelectorToExist} from '../../common/mutation-observer'
import {Selectors} from '../../roam/roam-selectors'
import {
    ensureMainPanelHasBlockSelected,
    ensureRightPanelHasBlockSelected,
    setSelectedBlockId,
    state,
} from './blockNavigation'
import {updateBlockNavigationView} from './blockNavigationView'
import {delay} from '../../common/async'
import {assumeExists} from '../../common/assert'

const selectBlockWheneverClicked = () => {
    document.addEventListener('focusin', event => {
        const element = event.target as HTMLElement
        if (element.classList.contains('rm-block-input')) {
            state.panel = element.closest(Selectors.mainContent) ? 'MAIN' : 'SIDEBAR'
            setSelectedBlockId(element.id)
            updateBlockNavigationView()
        }
    })
    document.addEventListener('focusout', event => {
        const element = event.target as HTMLElement
        if (element.classList.contains('rm-block-input')) {
            // Wait for textarea to turn back into a div
            const blockId = element.id
            const container = assumeExists(element.closest(Selectors.blockContainer)) as HTMLElement
            waitForSelectorToExist(`${Selectors.block}#${blockId}`, container).then(() => {
                updateBlockNavigationView()
            })
            // Delay doesn't work very well, because 'mouseup' is actually the one to trigger to re-render
        }
    })
}

let disconnectRightPanelArticleObserver = () => {}
const selectFirstBlockWheneverRightPanelOpens = () =>
    onSelectorChange(Selectors.rightPanel, () => {
        if (document.querySelector(Selectors.sidebarContent)) {
            ensureRightPanelHasBlockSelected()
            updateBlockNavigationView()
            selectFirstBlockWheneverClosingRightPanelArticle()
        } else {
            // Sidebar was closed, focus main panel again
            state.panel = 'MAIN'
            updateBlockNavigationView()
        }
    })

const selectFirstBlockWheneverClosingRightPanelArticle = () => {
    disconnectRightPanelArticleObserver()
    return onSelectorChange(Selectors.sidebarContent, () => {
        ensureRightPanelHasBlockSelected()
        updateBlockNavigationView()
    })
}

const selectFirstBlockWheneverNavigatingBetweenDailyNotes = () =>
    onSelectorChange(Selectors.mainPanel, () => {
        ensureMainPanelHasBlockSelected()
        updateBlockNavigationView()
        selectFirstBlockWheneverChangingPage()
    })

let disconnectArticleObserver = () => {}
const selectFirstBlockWheneverChangingPage = () => {
    disconnectArticleObserver()
    return onSelectorChange(Selectors.mainContent, () => {
        ensureMainPanelHasBlockSelected()
        updateBlockNavigationView()
    })
}

export const initializeBlockNavigationMode = async () => {
    await waitForSelectorToExist(Selectors.mainContent)
    // Wait for roam to finish setting classes on the block, to
    // avoid classes getting clobbered
    await delay(300)

    selectBlockWheneverClicked()

    // Set up separate mutation observers on specific elements,
    // in order to not avoid excessive irrelevant observations
    selectFirstBlockWheneverRightPanelOpens()
    selectFirstBlockWheneverNavigatingBetweenDailyNotes()
    selectFirstBlockWheneverChangingPage()

    ensureMainPanelHasBlockSelected()
    updateBlockNavigationView()
}
