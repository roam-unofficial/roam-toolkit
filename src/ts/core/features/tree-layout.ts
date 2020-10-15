import {browser} from 'webextension-polyfill-ts'
import cytoscape, {NodeDataDefinition} from 'cytoscape'
// @ts-ignore
import cola from 'cytoscape-cola'

import {Feature, Settings} from 'src/core/settings'
import {PanelElement} from 'src/core/features/vim-mode/roam/roam-panel'
import {RoamEvent} from 'src/core/features/vim-mode/roam/roam-event'
import {waitForSelectorToExist} from 'src/core/common/mutation-observer'
import {Selectors} from 'src/core/roam/selectors'
import {assumeExists} from 'src/core/common/assert'
import {injectStyle} from 'src/core/common/css'
import {Mouse} from 'src/core/common/mouse'
import {delay} from 'src/core/common/async'

/**
 * TODO Get rename page to work
 *
 * TODO Be able to resize nodes
 *
 * TODO Visually indicate if a main panel isn't "anchored" by a sidebar panel
 *
 * TODO Be able to enter spatial mode when sidebar panels are already open
 */

export const config: Feature = {
    id: 'spatial_graph_mode',
    name: 'Spatial Graph Mode',
    warning: 'May not work with custom css;',
    enabledByDefault: false,
}

const toggleSpatialGraphModeDependingOnSetting = () => {
    Settings.isActive('spatial_graph_mode').then(active => {
        if (active) {
            startSpatialGraphMode()
        } else {
            stopSpatialGraphMode()
        }
    })
}

browser.runtime.onMessage.addListener(async message => {
    if (message === 'settings-updated') {
        toggleSpatialGraphModeDependingOnSetting()
    }
})

toggleSpatialGraphModeDependingOnSetting()

const LAST_SELECTED_PANEL_CSS = 'roam-toolkit--source-panel'
const PANEL_SELECTOR = 'roam-toolkit--panel'

type PanelId = string

let justClickedPanelId: PanelId | null = null
const saveParentPanel = (interactedElement: HTMLElement) => {
    const justClickedPanel = interactedElement.closest(`.${PANEL_SELECTOR}`)
    if (!justClickedPanel) {
        return
    }
    document.querySelectorAll(`.${LAST_SELECTED_PANEL_CSS}`).forEach(selection => {
        selection.classList.remove(LAST_SELECTED_PANEL_CSS)
    })
    justClickedPanel.classList.add(LAST_SELECTED_PANEL_CSS)
    justClickedPanelId = justClickedPanel.id
}
const clearJustClickPanelId = () => {
    justClickedPanelId = null
}

const rememberLastInteractedPanel = () => {
    document.addEventListener('mousedown', event => {
        saveParentPanel(event.target as HTMLElement)
    })
    RoamEvent.onEditBlock(saveParentPanel)
}

let disconnectorFunctions: (() => void)[] = []
let previousIdToCount: {[id: string]: number} = {}
const startSpatialGraphMode = async () => {
    await waitForSelectorToExist(Selectors.mainContent)
    rememberLastInteractedPanel()
    const graph = GraphVisualization.get()
    // Wait for styles to finish applying, so panels have the right dimensions
    await delay(100)
    const layoutGraph = () => graph.runLayout()

    const updateMainPanel = () => {
        const mainPanel = assumeExists(document.querySelector('.roam-center > div'))
        mainPanel.classList.add(PANEL_SELECTOR)
        if (document.querySelector(Selectors.dailyNotes)) {
            mainPanel.id = `${PANEL_SELECTOR} DAILY_NOTES`
        } else {
            const mainTitle = assumeExists(document.querySelector('.rm-title-display')) as HTMLElement
            mainPanel.id = `${PANEL_SELECTOR} ${mainTitle.innerText}`
        }
        return mainPanel
    }

    const updateExplorationTree = async () => {
        // TODO extract the panel counting into a stateful sidebar manager
        const idToCount: {[id: string]: number} = {}
        const mainPanel = updateMainPanel()
        idToCount[mainPanel.id] = 1

        const panels = Array.from(document.querySelectorAll(Selectors.sidebarPage)) as PanelElement[]
        panels.forEach(panelElement => {
            panelElement.classList.add(PANEL_SELECTOR)
            const panelId = `${PANEL_SELECTOR} ${getPanelId(panelElement)}`
            panelElement.id = panelId
            if (idToCount[panelId]) {
                idToCount[panelId] += 1
                panelElement.classList.add('roam-toolkit--panel-dupe')
            } else {
                idToCount[panelId] = 1
                panelElement.classList.remove('roam-toolkit--panel-dupe')
            }
        })
        Object.keys(idToCount)
            .concat(Object.keys(previousIdToCount))
            .forEach(id => {
                if (idToCount[id] > (previousIdToCount[id] || 0)) {
                    console.log(`Added ${id}`)
                    graph.addNode(
                        id,
                        // It's impossible to link to daily notes
                        id === `${PANEL_SELECTOR} DAILY_NOTES` ? null : justClickedPanelId
                    )
                    // Allow only one sidebar panel, to keep the edges when switching main page.
                    // Disallow any more, cause they're redundant.
                    if (idToCount[id] > 1) {
                        const dupePanel = document.getElementById(id) as PanelElement
                        if (dupePanel) {
                            const closeButton = dupePanel.querySelector(Selectors.closeButton)
                            if (closeButton) {
                                Mouse.leftClick(closeButton as HTMLElement)
                            }
                        }
                    }
                }
                if ((idToCount[id] || 0) < previousIdToCount[id]) {
                    console.log(`Removed ${id}`)
                    // clean up the duplicate panel
                    // const dupePanel = document.getElementById(id) as PanelElement
                    // if (dupePanel) {
                    //     const closeButton = dupePanel.querySelector(Selectors.closeButton)
                    //     if (closeButton) {
                    //         Mouse.leftClick(closeButton as HTMLElement)
                    //     }
                    // }
                }
                previousIdToCount[id] = idToCount[id]
            })
        graph.cleanMissingNodes()
        layoutGraph()
    }

    // Don't attach edges when using the back/forward button
    // Unfortunately, this also makes it so plain clicks don't create edges.
    // You need to shift+click to create the edge
    window.addEventListener('popstate', clearJustClickPanelId)
    window.addEventListener('resize', layoutGraph)

    disconnectorFunctions = [
        () => window.removeEventListener('popstate', clearJustClickPanelId),
        () => window.removeEventListener('resize', layoutGraph),
        RoamEvent.onChangeBlock(layoutGraph),
        RoamEvent.onEditBlock(layoutGraph),
        RoamEvent.onBlurBlock(layoutGraph),
        RoamEvent.onSidebarToggle(updateExplorationTree),
        RoamEvent.onSidebarChange(updateExplorationTree),
        RoamEvent.onChangePage(updateExplorationTree),
    ]
    updateExplorationTree()
}

const getPanelId = (panelElement: PanelElement): string => {
    const header = assumeExists(panelElement.querySelector('[draggable] > .level2, [draggable] > div')) as HTMLElement
    const headerText = assumeExists(header.innerText)
    if (headerText === 'Block Outline') {
        // Need Selectors.blockInput, because ctrl+shift+o opens a panel with the block already focused
        return assumeExists(panelElement.querySelector(`${Selectors.block}, ${Selectors.blockInput}`)?.id)
    }
    return headerText
}

const GRAPH_MASK_ID = 'roam-toolkit-graph-mode--mask'
const GRAPH_MODE_CSS_ID = 'roam-toolkit-graph-mode'

const getDomViewport = (): HTMLElement => assumeExists(document.querySelector('.roam-body-main')) as HTMLElement

cytoscape.use(cola)

const MIN_EDGE_LENGTH = 50

class GraphVisualization {
    static instance: GraphVisualization | null
    cy: cytoscape.Core

    constructor(container: HTMLElement) {
        this.cy = cytoscape({
            container,
            style: [
                {
                    selector: 'node',
                    css: {
                        shape: 'roundrectangle',
                        color: '#b5b5b5',
                        // 'background-color': '#fff',
                        // 'background-opacity': 1,
                        // content: node => node.id().slice(20),
                        content: node => `${node.position().x}, ${node.position().y}`,
                    },
                },
                {
                    selector: 'edge',
                    css: {
                        'curve-style': 'bezier',
                        'target-arrow-shape': 'triangle',
                    },
                },
            ],
        })
        const domViewport = getDomViewport()
        this.cy.on('viewport resize render', () => {
            requestAnimationFrame(() => {
                domViewport.style.width = `${this.cy.width()}px`
                domViewport.style.height = `${this.cy.height()}px`
                domViewport.style.transform = `translate(${this.cy.pan().x}px, ${
                    this.cy.pan().y
                }px) scale(${this.cy.zoom()})`
                // @ts-ignore just for debugging the pan
                document.getElementById('find-or-create-input').placeholder = `${this.cy.pan().x}, ${this.cy.pan().y}`
            })
        })
        this.cy.on('render', () => {
            requestAnimationFrame(() => {
                // @ts-ignore .json() is just an object in the types
                const nodes = this.cy.json().elements.nodes
                if (nodes) {
                    nodes.forEach((node: NodeDataDefinition) => {
                        const panel = assumeExists(document.getElementById(assumeExists(node.data.id)))
                        const position = assumeExists(node.position)
                        panel.style.left = `${Math.round(position.x - panel.offsetWidth / 2)}px`
                        panel.style.top = `${Math.round(position.y - panel.offsetHeight / 2) + 8}px`
                    })
                }
            })
        })
        this.cy.maxZoom(1)
        this.cy.minZoom(0.2)
    }

    addNode(toPanel: PanelId, fromPanel: PanelId | null = null) {
        let node = this.cy.getElementById(toPanel)
        if (node.length === 0) {
            node = this.cy.add({
                data: {
                    id: toPanel,
                },
            })

            if (fromPanel) {
                const fromNode = this.cy.getElementById(fromPanel)
                node.position({
                    // Grow the graph towards the right
                    x: fromNode.position().x + fromNode.width() + MIN_EDGE_LENGTH,
                    y: fromNode.position().y,
                })
            } else {
                node.position(this.cy.pan())
            }
        }

        if (
            // Don't add an edge if you're air-dropping into an orphan page (e.g. search)
            fromPanel &&
            // Don't attach edges back to self
            fromPanel !== toPanel &&
            // Don't attach redundant edges
            this.cy.$(`edge[source = "${fromPanel}"][target = "${toPanel}"]`).length === 0
        ) {
            this.cy.edges().unselect()
            this.cy
                .add({
                    data: {
                        source: fromPanel,
                        target: toPanel,
                    },
                })
                .select()
        }

        // bring attention to the newly selected node
        this.cy.nodes().unselect()
        node.select()
        this.cy.promiseOn('layoutstop').then(() => {
            this.panTo(toPanel, fromPanel)
        })
    }

    panTo(toPanel: PanelId, fromPanel: PanelId | null = null) {
        let nodesToFocus = this.cy.getElementById(toPanel)
        if (fromPanel) {
            nodesToFocus = nodesToFocus.union(this.cy.getElementById(fromPanel))
        }
        this.cy.stop(true, true) // stop the previous animation
        this.cy.animate({
            fit: {
                eles: nodesToFocus,
                padding: 50,
            },
            easing: 'ease-out',
            duration: 200,
        })
    }

    cleanMissingNodes() {
        const missingNodes = this.cy.filter(element => element.isNode() && !document.getElementById(element.id()))
        missingNodes.connectedEdges().remove()
        missingNodes.remove()
    }
    runLayout() {
        this.cy.$('node').forEach(node => {
            const domNode = document.getElementById(node.id())
            if (domNode) {
                node.style('width', domNode.offsetWidth)
                node.style('height', domNode.offsetHeight + 15)
            }
        })
        this.cy
            .layout({
                name: 'cola',
                fit: false,
                // @ts-ignore
                maxSimulationTime: 200,
                nodeSpacing: () => MIN_EDGE_LENGTH,
            })
            .stop()
            .run()
    }

    resetPanelStyles() {
        // @ts-ignore .json() is just an object in the types
        const nodes = this.cy.json().elements.nodes
        if (nodes) {
            nodes.forEach((node: NodeDataDefinition) => {
                const panel = assumeExists(document.getElementById(assumeExists(node.data.id)))
                panel.style.removeProperty('left')
                panel.style.removeProperty('top')
            })
        }
    }

    static get(): GraphVisualization {
        if (!GraphVisualization.instance) {
            const graphElement = document.createElement('div')
            graphElement.id = GRAPH_MASK_ID
            document.body.prepend(graphElement)

            const domViewport = getDomViewport()
            injectStyle(
                `
                #${GRAPH_MASK_ID} {
                    position: fixed;
                    left: ${Math.round(domViewport.offsetLeft)}px;
                    right: 0;
                    top: ${Math.round(domViewport.offsetTop)}px;
                    bottom: 0;
                }
                :root {
                    --card-width: 550px;
                    --card-height-min: 200px;
                    --card-height-max: 80%;
                }

                /* REMOVE UI CRUFT */
                #right-sidebar {
                    background-color: transparent;
                }
                #right-sidebar > div:first-child, /* sidebar toggle */
                #buffer, /* help icon in the bottom right */
                .roam-toolkit--panel-dupe /* extra sidebar panels that match the main panel */ {
                    display: none !important;
                }
                /* remove horizontal dividers between sidebar pages */
                .sidebar-content > div > div {
                    border: none !important;
                }

                /* Make the whole app click-through-able, so we can pan/zoom Cytoscape */
                #app {
                    pointer-events: none;
                }
                /* But make the actual content itself clickable */
                .roam-sidebar-container, .roam-topbar, .roam-toolkit--panel {
                    pointer-events: auto;
                }

                /* The container that holds everything */
                .roam-body-main {
                    /* match Cytoscape's zoom origin */
                    transform-origin: 0 0;
                }
                .roam-center {
                    /* cancel position: static on the main panel */
                    position: absolute;
                }
                .roam-toolkit--panel {
                    border: 1px solid gray;
                    width: var(--card-width);
                    height: auto !important; /* prevent the main panel from stretching 100% */
                    max-height: var(--card-height-max);
                    position: absolute;
                    background: white;
                    overflow: scroll;
                }
                `,
                GRAPH_MODE_CSS_ID
            )

            GraphVisualization.instance = new GraphVisualization(graphElement)
        }
        return GraphVisualization.instance
    }

    static destroy() {
        if (GraphVisualization.instance) {
            GraphVisualization.instance.resetPanelStyles()
            const domViewport = getDomViewport()
            domViewport.style.width = '100vw'
            domViewport.style.removeProperty('height')
            domViewport.style.removeProperty('transform')

            document.getElementById(GRAPH_MODE_CSS_ID)?.remove()
            document.getElementById(GRAPH_MASK_ID)?.remove()

            GraphVisualization.instance = null
        }
    }
}

const stopSpatialGraphMode = () => {
    GraphVisualization.destroy()
    disconnectorFunctions.forEach(disconnect => disconnect())
    previousIdToCount = {}
    clearJustClickPanelId()
}
