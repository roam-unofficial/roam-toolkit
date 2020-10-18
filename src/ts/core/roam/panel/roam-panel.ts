import {entries} from 'lodash'
import {assumeExists} from 'src/core/common/assert'
import {Selectors} from 'src/core/roam/selectors'
import {RoamEvent} from 'src/core/features/vim-mode/roam/roam-event'
import {delay} from 'src/core/common/async'
import {DisconnectFn} from 'src/core/common/event'
import {toggleCssClass, toggleCssClassForAll} from 'src/core/common/css'
import {
    namespaceId,
    PANEL_CSS_CLASS,
    PANEL_SELECTOR,
    PanelElement,
    PanelId,
    plainId,
} from 'src/core/roam/panel/roam-panel-utils'
import {justClickedPanelId, rememberLastInteractedPanel} from 'src/core/roam/panel/roam-panel-origin'
import {GraphVisualization} from 'src/core/features/spatial-graph-mode/graph-visualization'

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

/**
 * A "Panel" is a viewport that contains blocks. It is analogous a vim window
 */
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

    /**
     * Tag the main panel's parent with css, so panel elements can consistently be accessed using the same selector.
     * Also allows us to apply common styles in spatial graph mode.
     */
    tagPanels() {
        // Remove panels tags that may be lingering when switching graph mode on/off
        toggleCssClassForAll(GRAPH_MODE_SCROLL_PANELS, PANEL_CSS_CLASS, !!GraphVisualization.instance)
        toggleCssClassForAll(DEFAULT_SCROLL_PANELS, PANEL_CSS_CLASS, !GraphVisualization.instance)
    },
}

// Treat each sidebar as an individual panel in spatial graph mode
// Use the innermost div, cause some css themes color them to look like a card
const DEFAULT_SCROLL_PANELS = `.roam-center > div:first-child, ${Selectors.sidebarScrollContainer}`
// If we're not in graph mode, then just use the default scroll containers
const GRAPH_MODE_SCROLL_PANELS = `${Selectors.mainContent}, ${Selectors.sidebarPage}`

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
    RoamPanel.tagPanels()
    const idToCount: {[id: string]: number} = {}
    const mainId = tagMainPanelId()
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

// Tagging panels with IDs allow easy syncing with the graph visualization
const tagMainPanelId = (): PanelId => {
    const mainPanel = getMainPanel()
    const nodeId = panelIdFromMainPage(mainPanel)
    mainPanel.id = namespaceId(nodeId)
    return nodeId
}

const tagSidebarPanel = (
    sidebarPage: PanelElement,
    panelId: PanelId,
    isDuplicate: boolean,
    duplicatesMain: boolean
) => {
    if (!isDuplicate) {
        // Only assign dom id to the first panel
        sidebarPage.id = namespaceId(panelId)
    }
    // Spatial graph mode can use this to close duplicates.
    // The classes can also helpful for debugging
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
