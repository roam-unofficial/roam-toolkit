import {entries} from 'lodash'
import {Selectors} from 'src/core/roam/selectors'
import {RoamEvent} from 'src/core/roam/roam-event'
import {delay} from 'src/core/common/async'
import {DisconnectFn} from 'src/core/common/event'
import {toggleCssClass, toggleCssClassForAll} from 'src/core/common/css'

import {GraphVisualization} from 'src/core/features/spatial-mode/graph-visualization'

import {
    getMainPanel,
    namespaceId,
    PANEL_CSS_CLASS,
    PanelElement,
    PanelId,
    panelIdFromMainPage,
    panelIdFromSidebarPage,
    plainId,
} from './roam-panel-utils'
import {justClickedPanelId, rememberLastInteractedPanel} from './roam-panel-origin'

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
    /**
     * To know which sidebars were opened/closed, we track previously opened sidebar pages,
     * and diff the pages anytime something changes. Kinda like an inverse virtual dom.
     */
    onPanelChange(handleChange: (event: PanelChange) => void): DisconnectFn {
        previousIdToCount = {}

        const emitEventsForPanelDiff = (isInitialAdd: boolean = false) => {
            const idDiffEntries = entries(getPanelCountDiff())

            handleChange({
                isInitialAdd,
                addedPanels: idDiffEntries
                    .filter(([_, diff]) => diff > 0)
                    .map(([id]) => ({
                        // It's impossible to link to "Daily Notes"
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
            // Only emit the event after sidebar pages finish updating their titles
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
        return () => disconnectFns.forEach(disconnect => disconnect())
    },

    getPanel(nodeId: PanelId): PanelElement | null {
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
// If we're not in graph mode, then just use the default scroll containers
const DEFAULT_SCROLL_PANELS = `${Selectors.mainBody} > div:first-child, ${Selectors.sidebarScrollContainer}`
// Use the innermost div, cause some css themes color them to look like a card
const GRAPH_MODE_SCROLL_PANELS = `${Selectors.mainContent}, ${Selectors.sidebarPage}`

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

    const sidebarPages: PanelElement[] = Array.from(document.querySelectorAll(Selectors.sidebarPage))
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
    const nodeId = panelIdFromMainPage()
    getMainPanel().id = namespaceId(nodeId)
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
    // Tag panels duplicate panels, that should be closed later.
    // We tag them in the DOM, cause stringing along variables gets messy.
    // The classes are also helpful for debugging
    toggleCssClass(sidebarPage, 'roam-toolkit--panel-dupe', isDuplicate)
    toggleCssClass(sidebarPage, 'roam-toolkit--panel-dupe-main', duplicatesMain)
}
