import cytoscape, {NodeDataDefinition, NodeSingular} from 'cytoscape'
// @ts-ignore
import cola from 'cytoscape-cola'
import {assumeExists} from 'src/core/common/assert'
import {RoamPanel} from 'src/core/roam/panel/roam-panel'
import {PanelId} from 'src/core/roam/panel/roam-panel-utils'
import {minBy} from 'lodash'
import {injectStyle} from 'src/core/common/css'
import {delay} from 'src/core/common/async'

const GRAPH_MASK_ID = 'roam-toolkit-graph-mode--mask'
const GRAPH_MODE_CSS_ID = 'roam-toolkit-graph-mode'

const getDomViewport = (): HTMLElement => assumeExists(document.querySelector('.roam-body-main')) as HTMLElement

const MIN_PANEL_HEIGHT = '200px'
const MAX_PANEL_HEIGHT = '80%'
const PANEL_WIDTH = '550px'

const MIN_EDGE_LENGTH = 50

cytoscape.use(cola)

export class GraphVisualization {
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
                        // TODO allow configuring colors for themes
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
        // TODO move dom manipulation outside, leave this class purely concerned with Cytoscape
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
                        const panel = assumeExists(RoamPanel.get(assumeExists(node.data.id)))
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

    removeNode(panel: PanelId) {
        this.cy.getElementById(panel).remove()
    }

    runLayout(firstRender: boolean = false) {
        this.cy.$('node').forEach(node => {
            const domNode = RoamPanel.get(node.id())
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
                const panel = assumeExists(RoamPanel.get(assumeExists(node.data.id)))
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

    selectMiddleOfViewport() {
        const middleNode = this.nodeInMiddleOfViewport()
        this.selectNode(middleNode)
    }

    ensureNodeIsSelected() {
        if (this.cy.nodes(':selected').length === 0) {
            this.selectMiddleOfViewport()
        }
    }

    onSelectNode(handleSelect: (nodeId: PanelId) => void) {
        this.cy.on('select', () => {
            handleSelect(this.cy.nodes(':selected').first().id())
        })
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
                    width: ${PANEL_WIDTH};
                    height: auto !important; /* prevent the main panel from stretching 100% */
                    min-height: ${MIN_PANEL_HEIGHT};
                    max-height: ${MAX_PANEL_HEIGHT};
                    border-radius: 5px;
                    position: absolute;
                    background: white;
                    overflow: scroll;
                    margin: 0 !important;
                }
                /* The innermost sidebar div plays best with custom themes */
                .sidebar-content .roam-toolkit--panel {
                    padding: 0 16px !important;
                }
                /* The innermost main div plays best with custom themes */
                .roam-center > div {
                    overflow: visible !important;
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
            domViewport.style.height = 'calc(100% - 45px)'
            domViewport.style.removeProperty('transform')

            document.getElementById(GRAPH_MODE_CSS_ID)?.remove()
            document.getElementById(GRAPH_MASK_ID)?.remove()

            GraphVisualization.instance = null
        }
    }
}

type Vector = {x: number; y: number}

const distance = (v1: Vector, v2: Vector) => Math.sqrt((v1.x - v2.x) ** 2 + (v1.y - v2.y) ** 2)
