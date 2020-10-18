import {entries, mergeWith} from 'lodash'
import {GraphVisualization} from 'src/core/features/spatial-graph-mode'
import {assumeExists} from 'src/core/common/assert'
import {Selectors} from 'src/core/roam/selectors'
import {RoamEvent} from 'src/core/features/vim-mode/roam/roam-event'
import {delay} from 'src/core/common/async'
import {DisconnectFn} from 'src/core/common/mutation-observer'

export type PanelElement = HTMLElement
export type DomId = string
export type PanelId = string

export const PANEL_CSS_CLASS = 'roam-toolkit--panel'
export const PANEL_SELECTOR = `.${PANEL_CSS_CLASS}`

type PanelChange = {
    type: 'ADD' | 'RENAME' | 'REMOVE'
    // The panel the new one was opened from
    fromPanel?: PanelId | null
    // The panel the was just opened
    panel: PanelId
}

export type DisconnectFn = () => void

let justClickedPanelId: PanelId | null = null
const clearJustClickedPanel = () => {
    justClickedPanelId = null
}
const saveJustClickedPanel = (interactedElement: HTMLElement) => {
    const justClickedPanel = interactedElement.closest(PANEL_SELECTOR)
    if (!justClickedPanel) {
        return
    }
    justClickedPanelId = plainId(justClickedPanel.id)
}
const rememberLastInteractedPanel = (): DisconnectFn[] => {
    clearJustClickedPanel()
    return [
        listenToEvent('mousedown', event => saveJustClickedPanel(event.target as HTMLElement)),
        RoamEvent.onEditBlock(saveJustClickedPanel),
    ]
}

type PanelToCount = {[id: string]: number}
let previousIdToCount: PanelToCount = {}

export const RoamPanel = {
    onPanelChange(handleChange: (event: PanelChange[]) => void): DisconnectFn[] {
        const emitEventsForPanelDiff = () => {
            const idToDiff = getPanelCountDiff()

            handleChange(
                entries(idToDiff)
                    .filter(([_, diff]) => diff !== 0)
                    .map(([id, diff]) =>
                        diff > 0
                            ? {
                                  type: 'ADD',
                                  // The panel the new one was opened from
                                  fromPanel: justClickedPanelId,
                                  // The panel the was just opened
                                  panel: id,
                              }
                            : {
                                  type: 'REMOVE',
                                  // The panel the was just opened
                                  panel: id,
                              }
                    )
            )
        }

        const emitRenameEvent = async (newTitle: string) => {
            const mainPanel = getMainPanel()
            const oldId = plainId(mainPanel.id)
            mainPanel.id = namespaceId(newTitle)
            // Wait for sidebar pages to update their titles
            await delay(10)
            // Update panel counts, in case complex sidebar pages changed their names
            previousIdToCount = tagAndCountPanels()
            handleChange([
                {
                    type: 'RENAME',
                    fromPanel: oldId,
                    panel: newTitle,
                },
            ])
        }

        return rememberLastInteractedPanel().concat([
            listenToEvent('popstate', clearJustClickedPanel),
            RoamEvent.onSidebarToggle(emitEventsForPanelDiff),
            RoamEvent.onSidebarChange(emitEventsForPanelDiff),
            RoamEvent.onChangePage(emitEventsForPanelDiff),
            RoamEvent.onRenamePage(emitRenameEvent),
        ])
    },

    get(nodeId: PanelId): PanelElement | null {
        return document.getElementById(namespaceId(nodeId))
    },
}

const listenToEvent = (event: string, handler: (event: Event) => void): DisconnectFn => {
    window.addEventListener(event, handler)
    return () => window.removeEventListener(event, handler)
}

const getMainPanel = (): PanelElement => assumeExists(document.querySelector('.roam-center > div')) as HTMLElement

const getPanelCountDiff = (): PanelToCount => {
    const idToCount = tagAndCountPanels()
    const idToDiff = mergeWith(
        previousIdToCount,
        idToCount,
        (previousCount, count) => (previousCount || 0) - (count || 0)
    )
    previousIdToCount = idToCount
    return idToDiff
}

const namespaceId = (nodeId: PanelId): DomId => `${PANEL_CSS_CLASS} ${nodeId}`
const plainId = (namespacedId: DomId): PanelId => namespacedId.slice(20)

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

/**
 * Tag the main panel's parent with css, so panel elements can consistently be accessed
 * using the same selector
 */
export const tagPanels = () => {
    if (GraphVisualization.instance) {
        // Prefer the graph visualization's choice of panels if applicable
        return
    }
    const articleElement = assumeExists(document.querySelector(Selectors.mainContent))
    const mainPanel = assumeExists(articleElement.parentElement)
    mainPanel.classList.add(PANEL_CSS_CLASS)
    const panels = Array.from(document.querySelectorAll(Selectors.sidebarScrollContainer)) as PanelElement[]
    panels.forEach(panelElement => panelElement.classList.add(PANEL_CSS_CLASS))
}

const toggleCssClass = (element: HTMLElement, className: string, toggleOn: boolean) => {
    if (toggleOn) {
        element.classList.add(className)
    } else {
        element.classList.remove(className)
    }
}
