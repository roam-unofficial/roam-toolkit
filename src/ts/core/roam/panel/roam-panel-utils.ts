import {assumeExists} from 'src/core/common/assert'
import {Selectors} from 'src/core/roam/selectors'

export type PanelElement = HTMLElement
export type DomId = string
/**
 * Each panel has a unique ID
 */
export type PanelId = string
export const PANEL_CSS_CLASS = 'roam-toolkit--panel'
export const PANEL_SELECTOR = `.${PANEL_CSS_CLASS}`

export const namespaceId = (nodeId: PanelId): DomId => `${PANEL_CSS_CLASS} ${nodeId}`
export const plainId = (namespacedId: DomId): PanelId => namespacedId.slice(20)

const firstBlockId = (panelElement: PanelElement) =>
    assumeExists(panelElement.querySelector(`${Selectors.block}, ${Selectors.blockInput}`)?.id)

export const panelIdFromSidebarPage = (sidebarPage: PanelElement): PanelId => {
    const header = assumeExists(sidebarPage.querySelector('.window-headers')) as HTMLElement
    const headerText = assumeExists(header.innerText)
    if (headerText === 'Block Outline') {
        // Need Selectors.blockInput, because ctrl+shift+o opens a panel with the block already focused
        return firstBlockId(sidebarPage)
    }

    const headerCollapsedLink = header.querySelector('div > a') as HTMLElement
    if (headerCollapsedLink) {
        return headerCollapsedLink.innerText
    }
    return panelIdFromMainPage(sidebarPage)
}

const getComplexPageName = (mainTitle: HTMLElement) =>
    (Array.from(mainTitle.childNodes) as (HTMLElement | Text)[])
        .map(node => (node as Text).data || `[[${(node as HTMLElement).dataset?.linkTitle}]]`)
        .join('')

export const panelIdFromMainPage = (mainPage: PanelElement): PanelId => {
    if (document.querySelector(Selectors.dailyNotes)) {
        return 'DAILY_NOTES'
    }

    const mainTitle = mainPage.querySelector('.rm-title-display > span') as HTMLElement
    if (mainTitle) {
        return getComplexPageName(mainTitle)
    }

    // Renaming the Main Page
    const mainTitleTextArea = mainPage.querySelector('.rm-title-textarea') as HTMLTextAreaElement
    if (mainTitleTextArea) {
        return mainTitleTextArea.value
    }

    // Block Outline
    if (mainPage.querySelector('.rm-zoom')) {
        // Treat block outlines on the main page as having the same id
        // As the main page itself, so we don't create/destroy panels
        // when zooming in/out
        const firstBreadcrumb = assumeExists(mainPage.querySelector('.rm-zoom-item-content')) as HTMLElement
        return firstBreadcrumb.innerText
    }

    throw new Error('Could not identify the main panel')
}

export const getMainPanel = (): PanelElement =>
    assumeExists(document.querySelector(Selectors.mainContent)) as HTMLElement
