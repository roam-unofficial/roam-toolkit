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

export const config: Feature = {
    id: 'tree_layout',
    name: 'Layout Pages in a Tree',
    warning: 'Experimental; Intrusive, may interfere with your regular workflow',
    enabledByDefault: false,
}

const toggleTreeLayoutDependingOnSetting = () => {
    Settings.isActive('tree_layout').then(active => {
        if (active) {
            startTreeLayoutMode()
        }
    })
}

browser.runtime.onMessage.addListener(async message => {
    if (message === 'settings-updated') {
        toggleTreeLayoutDependingOnSetting()
    }
})

toggleTreeLayoutDependingOnSetting()

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

const rememberLastInteractedPanel = () => {
    document.addEventListener('mousedown', event => {
        saveParentPanel(event.target as HTMLElement)
    })
    RoamEvent.onEditBlock(saveParentPanel)
}

const previousIdToCount: {[id: string]: number} = {}
const startTreeLayoutMode = async () => {
    await waitForSelectorToExist(Selectors.mainContent)
    rememberLastInteractedPanel()
    const graph = GraphVisualization.get()

    const updateMainPanel = () => {
        const mainPanel = assumeExists(document.querySelector('.roam-center > div'))
        mainPanel.classList.add(PANEL_SELECTOR)
        const mainTitle = assumeExists(document.querySelector('.rm-title-display')) as HTMLElement
        mainPanel.id = `${PANEL_SELECTOR} ${mainTitle.innerText}`
        return mainPanel
    }

    const updateExplorationTree = () => {
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
                    graph.addNode(id, justClickedPanelId)
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
        graph.runLayout()
    }

    window.addEventListener('resize', () => graph.runLayout())
    RoamEvent.onChangeBlock(() => graph.runLayout())
    RoamEvent.onEditBlock(() => graph.runLayout())
    RoamEvent.onBlurBlock(() => graph.runLayout())
    RoamEvent.onSidebarToggle(updateExplorationTree)
    RoamEvent.onSidebarChange(updateExplorationTree)
    RoamEvent.onChangePage(updateExplorationTree)
}

const getPanelId = (panelElement: PanelElement): string => {
    const header = assumeExists(panelElement.querySelector('[draggable] > .level2, [draggable] > div')) as HTMLElement
    const headerText = assumeExists(header.innerText)
    if (headerText === 'Block Outline') {
        return assumeExists(panelElement.querySelector(Selectors.block)?.id)
    }
    return headerText
}

const GRAPH_MASK_ID = 'roam-toolkit-graph-mode--mask'

const getDomViewport = (): HTMLElement => assumeExists(document.querySelector('.roam-body-main')) as HTMLElement

cytoscape.use(cola)

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
                        // content: node => node.id().slice(20),
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
        if (this.cy.getElementById(toPanel).length === 0) {
            this.cy.add({
                data: {
                    id: toPanel,
                },
                // position: fromPanel ? this.cy.getElementById(fromPanel).position : {x: 0, y: 0},
            })
        }

        if (
            fromPanel &&
            fromPanel !== toPanel &&
            this.cy.$(`edge[source = "${fromPanel}"][target = "${toPanel}"]`).length === 0
        ) {
            this.cy.add({
                data: {
                    source: fromPanel,
                    target: toPanel,
                },
            })
        }
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
                nodeSpacing: () => 50,
            })
            .stop()
            .run()
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
                `,
                'roam-toolkit-graph-mode'
            )

            GraphVisualization.instance = new GraphVisualization(graphElement)
        }
        return GraphVisualization.instance
    }
}
