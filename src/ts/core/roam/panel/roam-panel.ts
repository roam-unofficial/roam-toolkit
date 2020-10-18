import {entries} from 'lodash'
import {assumeExists} from 'src/core/common/assert'
import {Selectors} from 'src/core/roam/selectors'
import {RoamEvent} from 'src/core/features/vim-mode/roam/roam-event'
import {delay} from 'src/core/common/async'
import {DisconnectFn} from 'src/core/common/event'
import {toggleCssClass} from 'src/core/common/css'
import {
    namespaceId,
    PANEL_CSS_CLASS,
    PANEL_SELECTOR,
    PanelElement,
    PanelId,
    plainId,
} from 'src/core/roam/panel/roam-panel-utils'
import {justClickedPanelId, rememberLastInteractedPanel} from 'src/core/roam/panel/roam-panel-origin'

export type PanelChange = {
    // Is this initial bulk add?
    isInitialAdd: boolean
    // Panels that were just opened
    addedPanels?: {
        // The panel the new one was opened from
        from: PanelId | null
        to: PanelId
    }[]
    removedPanels?: PanelId[]
    renamedPanel?: {
        before: PanelId
        after: PanelId
    }
}

type PanelToCount = {[id: string]: number}
let previousIdToCount: PanelToCount = {}

export const RoamPanel = {
    onPanelChange(handleChange: (event: PanelChange) => void): DisconnectFn {
        const emitEventsForPanelDiff = (isInitialAdd: boolean = false) => {
            const idDiffEntries = entries(getPanelCountDiff())

            handleChange({
                isInitialAdd,
                addedPanels: idDiffEntries
                    .filter(([_, diff]) => diff > 0)
                    .map(([id]) => ({
                        from: id === 'DAILY_NOTES' ? null : justClickedPanelId(),
                        to: id,
                    })),
                removedPanels: idDiffEntries.filter(([_, diff]) => diff < 0).map(([id]) => id),
            })
        }

        const emitRenameEvent = async (newTitle: string) => {
            const mainPanel = getMainPanel()
            const oldId = plainId(mainPanel.id)
            mainPanel.id = namespaceId(newTitle)
            // Wait for sidebar pages to update their titles
            await delay(10)
            // Update panel counts, in case complex sidebar pages changed their names
            previousIdToCount = tagAndCountPanels()
            handleChange({
                isInitialAdd: false,
                renamedPanel: {
                    before: oldId,
                    after: newTitle,
                },
            })
        }

        // Remove panels tags that may be lingering from vim mode
        document.querySelectorAll(PANEL_SELECTOR).forEach(panel => panel.classList.remove(PANEL_CSS_CLASS))
        emitEventsForPanelDiff(true)
        const disconnectFns = [
            rememberLastInteractedPanel(),
            RoamEvent.onSidebarToggle(() => emitEventsForPanelDiff()),
            RoamEvent.onSidebarChange(() => emitEventsForPanelDiff()),
            RoamEvent.onChangePage(() => emitEventsForPanelDiff()),
            RoamEvent.onRenamePage(emitRenameEvent),
        ]
        return () => {
            previousIdToCount = {}
            disconnectFns.forEach(disconnect => disconnect())
        }
    },

    get(nodeId: PanelId): PanelElement | null {
        return document.getElementById(namespaceId(nodeId))
    },
}

const getMainPanel = (): PanelElement => assumeExists(document.querySelector(Selectors.mainContent)) as HTMLElement

const getPanelCountDiff = (): PanelToCount => {
    const idToCount = tagAndCountPanels()
    const idToDiff: {[id: string]: number} = {}
    Object.keys(idToCount)
        .concat(Object.keys(previousIdToCount))
        .forEach(id => {
            idToDiff[id] = (idToCount[id] || 0) - (previousIdToCount[id] || 0)
        })
    previousIdToCount = idToCount
    return idToDiff
}

const tagAndCountPanels = (): {[id: string]: number} => {
    const idToCount: {[id: string]: number} = {}
    const mainId = tagMainPanel()
    idToCount[mainId] = 1

    const sidebarPages = Array.from(document.querySelectorAll(Selectors.sidebarPage)) as PanelElement[]
    sidebarPages.forEach(sidebarPage => {
        const panelId = panelIdFromSidebarPage(sidebarPage)
        if (idToCount[panelId]) {
            idToCount[panelId] += 1
        } else {
            idToCount[panelId] = 1
        }
        tagSidebarPanel(sidebarPage, panelId, idToCount[panelId] > 1, panelId === mainId)
    })
    // Provide a visual indicator that the main panel is anchored by an invisible sidebar page
    toggleCssClass(getMainPanel(), 'roam-toolkit--panel-anchored', idToCount[mainId] > 1)
    return idToCount
}

const tagMainPanel = (): PanelId => {
    const mainPanel = getMainPanel()
    const nodeId = panelIdFromMainPage(mainPanel)
    mainPanel.classList.add(PANEL_CSS_CLASS)
    mainPanel.id = namespaceId(nodeId)
    return nodeId
}

const tagSidebarPanel = (
    sidebarPage: PanelElement,
    panelId: PanelId,
    isDuplicate: boolean,
    duplicatesMain: boolean
) => {
    sidebarPage.classList.add(PANEL_CSS_CLASS)
    if (!isDuplicate) {
        // Only assign dom id to the first panel
        sidebarPage.id = namespaceId(panelId)
    }
    toggleCssClass(sidebarPage, 'roam-toolkit--panel-dupe', isDuplicate)
    toggleCssClass(sidebarPage, 'roam-toolkit--panel-dupe-main', duplicatesMain)
}

const panelIdFromSidebarPage = (sidebarPage: PanelElement): string => {
    const header = assumeExists(sidebarPage.querySelector('[draggable] > .level2, [draggable] > div')) as HTMLElement
    const headerText = assumeExists(header.innerText)
    if (headerText === 'Block Outline') {
        // Need Selectors.blockInput, because ctrl+shift+o opens a panel with the block already focused
        return assumeExists(sidebarPage.querySelector(`${Selectors.block}, ${Selectors.blockInput}`)?.id)
    }
    return headerText
}

const getComplexPageName = (mainTitle: HTMLElement) =>
    (Array.from(mainTitle.childNodes) as (HTMLElement | Text)[])
        .map(node => (node as Text).data || `[[${(node as HTMLElement).dataset?.linkTitle}]]`)
        .join('')

const panelIdFromMainPage = (mainPanelElement: PanelElement): PanelId => {
    let nodeId
    if (document.querySelector(Selectors.dailyNotes)) {
        nodeId = 'DAILY_NOTES'
    } else {
        const mainTitle = mainPanelElement.querySelector('.rm-title-display > span') as HTMLElement
        if (mainTitle) {
            nodeId = getComplexPageName(mainTitle)
        } else {
            const mainTitleTextArea = mainPanelElement.querySelector('.rm-title-textarea') as HTMLTextAreaElement
            nodeId = mainTitleTextArea.value
        }
    }
    return nodeId
}
