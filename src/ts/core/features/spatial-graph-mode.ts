import {minBy} from 'lodash'
import {browser} from 'webextension-polyfill-ts'
import cytoscape, {NodeDataDefinition, NodeSingular} from 'cytoscape'
// @ts-ignore
import cola from 'cytoscape-cola'

import {Feature, Settings, Shortcut} from 'src/core/settings'
import {RoamEvent} from 'src/core/features/vim-mode/roam/roam-event'
import {waitForSelectorToExist} from 'src/core/common/mutation-observer'
import {Selectors} from 'src/core/roam/selectors'
import {assumeExists} from 'src/core/common/assert'
import {injectStyle} from 'src/core/common/css'
import {Mouse} from 'src/core/common/mouse'
import {delay} from 'src/core/common/async'
import {getMode, Mode} from 'src/core/features/vim-mode/vim'
import {RoamPanel} from 'src/core/features/vim-mode/roam/roam-panel'
import {updateVimView} from 'src/core/features/vim-mode/vim-view'

/**
 * TODO Be able to resize nodes
 *
 * TODO Maybe allow cutting edges with double click?
 */

const spatialShortcut = (
    key: string,
    label: string,
    onPress: (graph: GraphVisualization) => void,
    selectMiddleNode: boolean = true
): Shortcut => ({
    type: 'shortcut',
    id: `spatialGraphMode_${label}`,
    label,
    initValue: key,
    onPress: () => {
        if (getMode() === Mode.NORMAL) {
            const graph = GraphVisualization.get()
            onPress(graph)

            if (selectMiddleNode) {
                const middleNode = graph.nodeInMiddleOfViewport()
                graph.selectNode(middleNode)
                // This should probably emit an event, rather than directly much with vim state
                RoamPanel.get(assumeExists(getPanelElement(middleNode.id()))).select()
                updateVimView()
            }
        }
    },
})

const PAN_SPEED = 20
const MOVEMENT_SPEED = 100

export const config: Feature = {
    id: 'spatial_graph_mode',
    name: 'Spatial Graph Mode',
    warning: 'Will probably break custom css;',
    enabledByDefault: false,
    settings: [
        spatialShortcut('Ctrl+ArrowUp', 'Zoom in', graph => {
            graph.zoomBy(5 / 4)
        }),
        spatialShortcut('Ctrl+ArrowDown', 'Zoom out', graph => {
            graph.zoomBy(4 / 5)
        }),
        spatialShortcut('Ctrl+0', 'Zoom in completely', graph => {
            graph.zoomBy(10)
        }),
        spatialShortcut('Ctrl+9', 'Zoom out completely', graph => {
            graph.zoomOutCompletely()
        }),
        spatialShortcut('ArrowLeft', 'Pan left', graph => {
            graph.panBy(PAN_SPEED, 0)
        }),
        spatialShortcut('ArrowDown', 'Pan down', graph => {
            graph.panBy(0, -PAN_SPEED)
        }),
        spatialShortcut('ArrowUp', 'Pan up', graph => {
            graph.panBy(0, PAN_SPEED)
        }),
        spatialShortcut('ArrowRight', 'Pan right', graph => {
            graph.panBy(-PAN_SPEED, 0)
        }),
        spatialShortcut(
            'Shift+ArrowLeft',
            'Move node left',
            graph => {
                graph.dragSelectionBy(-MOVEMENT_SPEED, 0)
            },
            false
        ),
        spatialShortcut(
            'Shift+ArrowDown',
            'Move node down',
            graph => {
                graph.dragSelectionBy(0, MOVEMENT_SPEED)
            },
            false
        ),
        spatialShortcut(
            'Shift+ArrowUp',
            'Move node up',
            graph => {
                graph.dragSelectionBy(0, -MOVEMENT_SPEED)
            },
            false
        ),
        spatialShortcut(
            'Shift+ArrowRight',
            'Move node right',
            graph => {
                graph.dragSelectionBy(MOVEMENT_SPEED, 0)
            },
            false
        ),
    ],
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

type PanelElement = HTMLElement
type PanelId = string
type NodeId = string

let justClickedPanelId: NodeId | null = null
const saveParentPanel = (interactedElement: HTMLElement) => {
    const justClickedPanel = interactedElement.closest(`.${PANEL_SELECTOR}`)
    if (!justClickedPanel) {
        return
    }
    document.querySelectorAll(`.${LAST_SELECTED_PANEL_CSS}`).forEach(selection => {
        selection.classList.remove(LAST_SELECTED_PANEL_CSS)
    })
    justClickedPanel.classList.add(LAST_SELECTED_PANEL_CSS)
    justClickedPanelId = plainId(justClickedPanel.id)
}
const clearJustClickPanelId = () => {
    justClickedPanelId = null
}

const rememberLastInteractedPanel = () => {
    document.addEventListener('mousedown', event => {
        saveParentPanel(event.target as HTMLElement)
    })
    RoamEvent.onEditBlock(saveParentPanel)
    clearJustClickPanelId()
}

const getComplexPageName = (mainTitle: HTMLElement) =>
    (Array.from(mainTitle.childNodes) as (HTMLElement | Text)[])
        .map(node => (node as Text).data || `[[${(node as HTMLElement).dataset?.linkTitle}]]`)
        .join('')

const namespaceId = (nodeId: NodeId): PanelId => `${PANEL_SELECTOR} ${nodeId}`
const plainId = (namespacedId: PanelId): NodeId => namespacedId.slice(20)

let disconnectorFunctions: (() => void)[] = []
let previousIdToCount: {[id: string]: number} = {}
const startSpatialGraphMode = async () => {
    await waitForSelectorToExist(Selectors.mainContent)
    await GraphVisualization.init()

    const graph = GraphVisualization.get()
    rememberLastInteractedPanel()
    const layoutGraph = () => graph.runLayout()

    const tagMainPanel = (): [NodeId, PanelElement] => {
        const mainPanel = assumeExists(document.querySelector('.roam-center > div')) as PanelElement
        mainPanel.classList.add(PANEL_SELECTOR)
        let nodeId
        if (document.querySelector(Selectors.dailyNotes)) {
            nodeId = 'DAILY_NOTES'
        } else {
            const mainTitle = document.querySelector('.rm-title-display > span') as HTMLElement
            if (mainTitle) {
                nodeId = getComplexPageName(mainTitle)
            } else {
                const mainTitleTextArea = document.querySelector('.rm-title-textarea') as HTMLTextAreaElement
                nodeId = mainTitleTextArea.value
            }
        }
        mainPanel.id = namespaceId(nodeId)
        return [nodeId, mainPanel]
    }

    const updateNodeNames = async (newTitle: string) => {
        const mainPanel = assumeExists(document.querySelector('.roam-center > div'))
        // We need to update cytoscape's node names, to keep the edges.
        // Otherwise, it'll just seem like all the sidebar pages are freshly opened.
        graph.replaceNodeNames(plainId(mainPanel.id), newTitle)
        mainPanel.id = namespaceId(newTitle)
        // Wait for sidebar pages to update their titles
        await delay(10)
        // Don't draw an edge from the previous main page to the new main page
        clearJustClickPanelId()
        // Pretend the new complex sidebar panels were there all along, after renaming a page
        previousIdToCount = tagAndCountPanels()
    }

    const tagAndCountPanels = (): {[id: string]: number} => {
        const idToCount: {[id: string]: number} = {}
        const [mainId, mainPanel] = tagMainPanel()
        idToCount[mainId] = 1

        const panels = Array.from(document.querySelectorAll(Selectors.sidebarPage)) as PanelElement[]
        panels.forEach(panel => {
            panel.classList.add(PANEL_SELECTOR)
            const panelId = panelIdFromSidebarPage(panel)
            if (idToCount[panelId]) {
                idToCount[panelId] += 1
                panel.classList.add('roam-toolkit--panel-dupe')
                if (panelId === mainId) {
                    // Sidebar pages that duplicate the main page are are useful cause
                    // They anchor the main page's edges. Mark them so we can keep them.
                    panel.classList.add('roam-toolkit--panel-dupe-main')
                }
            } else {
                idToCount[panelId] = 1
                panel.classList.remove('roam-toolkit--panel-dupe', 'roam-toolkit--panel-dupe-main')
                // Don't assign ids on the duplicate panels
                panel.id = namespaceId(panelId)
            }
        })
        if (idToCount[mainId] > 1) {
            // Provide a visual indicator that the main panel is anchored by an invisible sidebar page
            mainPanel.classList.add('roam-toolkit--panel-anchored')
        } else {
            mainPanel.classList.remove('roam-toolkit--panel-anchored')
        }
        return idToCount
    }

    const updateGraphToMatchOpenPanels = (firstRender: boolean = false) => {
        // TODO extract the panel counting into a stateful sidebar manager
        const idToCount = tagAndCountPanels()
        const redundantPanels = Array.from(document.getElementsByClassName('roam-toolkit--panel-dupe')).filter(
            panelElement => !panelElement.classList.contains('roam-toolkit--panel-dupe-main')
        )
        // Avoid having identical sidebar pages open
        if (redundantPanels.length > 0) {
            redundantPanels.forEach(panel => {
                if (panel) {
                    const closeButton = panel.querySelector(Selectors.closeButton)
                    if (closeButton) {
                        Mouse.leftClick(closeButton as HTMLElement)
                    }
                }
            })
            // Skip re-rendering, cause the sidebar pages will change after closing the panel anyways
            return
        }
        Object.keys(idToCount)
            .concat(Object.keys(previousIdToCount))
            .forEach(id => {
                if (idToCount[id] > (previousIdToCount[id] || 0)) {
                    graph.addNode(
                        id,
                        // It's impossible to link to daily notes
                        id === 'DAILY_NOTES' ? null : justClickedPanelId
                    )
                }
            })
        previousIdToCount = idToCount
        graph.cleanMissingNodes()
        graph.runLayout(!firstRender)
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
        RoamEvent.onSidebarToggle(updateGraphToMatchOpenPanels),
        RoamEvent.onSidebarChange(updateGraphToMatchOpenPanels),
        RoamEvent.onChangePage(updateGraphToMatchOpenPanels),
        RoamEvent.onRenamePage(updateNodeNames),
    ]
    updateGraphToMatchOpenPanels(true)
}

const panelIdFromSidebarPage = (panel: PanelElement): string => {
    const header = assumeExists(panel.querySelector('[draggable] > .level2, [draggable] > div')) as HTMLElement
    const headerText = assumeExists(header.innerText)
    if (headerText === 'Block Outline') {
        // Need Selectors.blockInput, because ctrl+shift+o opens a panel with the block already focused
        return assumeExists(panel.querySelector(`${Selectors.block}, ${Selectors.blockInput}`)?.id)
    }
    return headerText
}

const GRAPH_MASK_ID = 'roam-toolkit-graph-mode--mask'
const GRAPH_MODE_CSS_ID = 'roam-toolkit-graph-mode'

const getDomViewport = (): HTMLElement => assumeExists(document.querySelector('.roam-body-main')) as HTMLElement

const getPanelElement = (nodeId: NodeId): PanelElement | null => document.getElementById(namespaceId(nodeId))

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
            })
        })
        this.cy.on('render', () => {
            requestAnimationFrame(() => {
                // @ts-ignore .json() is just an object in the types
                const nodes = this.cy.json().elements.nodes
                if (nodes) {
                    nodes.forEach((node: NodeDataDefinition) => {
                        const panel = assumeExists(getPanelElement(assumeExists(node.data.id)))
                        const position = assumeExists(node.position)
                        panel.style.left = `${Math.round(position.x - panel.offsetWidth / 2)}px`
                        panel.style.top = `${Math.round(position.y - panel.offsetHeight / 2) + 5}px`
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
                    // Tiny random offset prevents nodes from getting jammed if it spawns
                    // in the exact same location as another
                    y: fromNode.position().y + Math.random() * 10,
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
        this.selectNode(node)
        this.cy.promiseOn('layoutstop').then(() => {
            this.panTo(toPanel, fromPanel)
        })
    }

    replaceNodeNames(before: string, after: string) {
        if (before === after) {
            return
        }
        // Replace the main node itself
        this.renameNode(this.cy.getElementById(before), after)
        // Replace usages in complex pages
        this.cy.nodes().forEach(node => {
            if (node.id().includes(`[[${before}]]`)) {
                this.renameNode(node, node.id().replace(`[[${before}]]`, `[[${after}]]`))
            }
        })
    }

    renameNode(node: NodeSingular, name: string) {
        // node ids are immutable. We have to create a new one
        const newNode = this.cy.add({
            data: {
                id: name,
            },
        })
        newNode.position(node.position())
        newNode.style('width', node.style('width'))
        newNode.style('height', node.style('height'))
        node.connectedEdges(`[source = "${node.id()}"]`).forEach(edge => {
            this.cy.add({
                data: {
                    source: name,
                    target: edge.target().id(),
                },
            })
        })
        node.connectedEdges(`[target = "${node.id()}"]`).forEach(edge => {
            this.cy.add({
                data: {
                    source: edge.source().id(),
                    target: name,
                },
            })
        })
        node.remove()
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
        const missingNodes = this.cy.filter(element => element.isNode() && !getPanelElement(element.id()))
        missingNodes.connectedEdges().remove()
        missingNodes.remove()
    }

    runLayout(firstRender: boolean = false) {
        this.cy.$('node').forEach(node => {
            const domNode = getPanelElement(node.id())
            if (domNode) {
                node.style('width', domNode.offsetWidth + 10)
                node.style('height', domNode.offsetHeight + 20)
            }
        })
        this.cy
            .layout({
                name: 'cola',
                fit: false,
                // @ts-ignore randomize when laying out for the first time, to avoid seizures from all the nodes being jammed on the same space
                randomize: firstRender,
                // @ts-ignore
                maxSimulationTime: firstRender ? 1000 : 200,
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
                const panel = assumeExists(getPanelElement(assumeExists(node.data.id)))
                panel.style.removeProperty('left')
                panel.style.removeProperty('top')
            })
        }
    }

    zoomBy(scale: number) {
        this.cy.zoom({
            level: this.cy.zoom() * scale,
            renderedPosition: {
                x: this.cy.width() / 2,
                y: this.cy.height() / 2,
            },
        })
    }

    zoomOutCompletely() {
        this.cy.fit(undefined, 50)
    }

    panBy(x: number, y: number) {
        this.cy.panBy({x, y})
    }

    selectNode(node: NodeSingular) {
        this.cy.edges().unselect()
        this.cy.nodes().unselect()
        node.select().edges().select()
    }

    dragSelectionBy(x: number, y: number) {
        const zoom = this.cy.zoom()
        this.cy.nodes(':selected').shift({x: x / zoom, y: y / zoom})
        this.panBy(-x, -y)
    }

    nodeInMiddleOfViewport(): NodeSingular {
        const viewport = this.cy.extent()
        const viewportMiddle = {
            x: viewport.x1 + viewport.w / 2,
            y: viewport.y1 + viewport.h / 2,
        }
        return assumeExists(
            minBy(
                this.cy.nodes().map(node => node),
                node => {
                    return distance(viewportMiddle, node.position())
                }
            )
        )
    }

    static async init() {
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
                    width: var(--card-width);
                    height: auto !important; /* prevent the main panel from stretching 100% */
                    max-height: var(--card-height-max);
                    border-radius: 5px;
                    position: absolute;
                    background: white;
                    overflow: scroll;
                }
                .sidebar-content .roam-toolkit--panel {
                    margin: 0 !important;
                    padding: 0 16px !important;
                }
                /* Indicate when a main panel's edges are anchored by a hidden sidebar*/
                .roam-toolkit--panel-anchored::before {
                    content: "⚓";
                    left: 6px;
                    top: 6px;
                    position: absolute;
                }
                `,
                GRAPH_MODE_CSS_ID
            )

            GraphVisualization.instance = new GraphVisualization(graphElement)
            // Wait for styles to finish applying, so panels have the right dimensions,
            // and cytoscape has fully instantiated
            await delay(300)
        }
    }

    static get(): GraphVisualization {
        return assumeExists(GraphVisualization.instance)
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

type Vector = {x: number; y: number}

const distance = (v1: Vector, v2: Vector) => Math.sqrt((v1.x - v2.x) ** 2 + (v1.y - v2.y) ** 2)

const stopSpatialGraphMode = () => {
    GraphVisualization.destroy()
    disconnectorFunctions.forEach(disconnect => disconnect())
    previousIdToCount = {}
    clearJustClickPanelId()
}
