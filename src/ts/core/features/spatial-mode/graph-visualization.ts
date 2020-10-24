import cytoscape, {NodeSingular} from 'cytoscape'
// @ts-ignore
import cola from 'cytoscape-cola'
import {assumeExists} from 'src/core/common/assert'
import {delay} from 'src/core/common/async'
import {Vector} from 'src/core/common/vector'
import {unselectText} from 'src/core/common/selection'

import {RoamPanel} from 'src/core/roam/panel/roam-panel'
import {PanelId} from 'src/core/roam/panel/roam-panel-utils'

import {SpatialViewport} from './spatial-viewport'
import {SpatialSettings} from './spatial-settings'
import {getCytoscapeContainer, removeCytoscapeContainer} from './spatial-container'
import {SpatialDomSynchronizer} from './spatial-dom-synchronizer'

export type GraphData = {
    nodes: NodeData[]
    edges: EdgeData[]
    zoom: number
    pan: Vector
}
type NodeData = {
    id: string
    position: Vector
    width: number
    height: number
}
type EdgeData = {
    source: string
    target: string
}

const getCytoscapeStyles = () => {
    const color = SpatialSettings.get('Node Color')
    const selectionColor = SpatialSettings.get('Selection Color')
    return [
        {
            selector: 'node',
            css: {
                shape: 'roundrectangle',
                'background-color': color,
            },
        },
        {
            selector: 'edge',
            css: {
                'line-color': color,
                'target-arrow-color': color,
                'source-arrow-color': color,
                'curve-style': 'bezier',
                'target-arrow-shape': 'triangle',
            },
        },
        {
            selector: ':selected',
            css: {
                'background-color': selectionColor,
                'line-color': selectionColor,
                'target-arrow-color': selectionColor,
                'source-arrow-color': selectionColor,
            },
        },
    ]
}

cytoscape.use(cola)

export class GraphVisualization {
    static instance: GraphVisualization | null

    private cy: cytoscape.Core
    private synchronizer: SpatialDomSynchronizer
    viewport: SpatialViewport

    constructor(container: HTMLElement) {
        this.cy = cytoscape({
            container,
            style: getCytoscapeStyles(),
        })
        this.synchronizer = new SpatialDomSynchronizer(this.cy)
        this.viewport = new SpatialViewport(this.cy)
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
                    x: fromNode.position().x + fromNode.width() + SpatialSettings.getNodeSpacing(),
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
        this.viewport.selectNode(node)
        this.cy.promiseOn('layoutstop').then(() => {
            const followBehavior = SpatialSettings.get('Follow nodes on open (off/pan/panZoom)')
            if (followBehavior === 'pan' || followBehavior === 'panZoom') {
                this.viewport.panTo(toPanel, fromPanel, followBehavior, unselectText)
            }
            unselectText()
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

    private renameNode(node: NodeSingular, name: string) {
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

    removeNode(panel: PanelId) {
        this.cy.getElementById(panel).remove()
    }

    runLayout(firstRender: boolean = false): Promise<any> {
        this.cy.nodes().forEach(node => {
            const panelElement = RoamPanel.getPanel(node.id())
            if (panelElement) {
                node.style('width', panelElement.offsetWidth + 10)
                node.style('height', panelElement.offsetHeight + 20)
            }
        })
        this.cy
            .layout({
                name: 'cola',
                fit: false,
                // @ts-ignore randomize when laying out for the first time, to avoid seizures from all the nodes being jammed on the same space
                randomize: firstRender,
                // @ts-ignore
                animate: SpatialSettings.getLayoutDuration() > 0,
                // @ts-ignore
                maxSimulationTime: SpatialSettings.getLayoutDuration() || 1000,
                // @ts-ignore if maxSimulationTime is too low, the layout doesn't actually run
                nodeSpacing: SpatialSettings.getNodeSpacing(),
            })
            .stop()
            .run()

        return this.cy.promiseOn('layoutstop')
    }

    save(): GraphData {
        return {
            nodes: this.cy.nodes().map(node => ({
                id: node.id(),
                position: node.position(),
                width: node.width(),
                height: node.height(),
            })),
            edges: this.cy.edges().map(edge => ({
                source: edge.source().id(),
                target: edge.target().id(),
            })),
            zoom: this.cy.zoom(),
            pan: this.cy.pan(),
        }
    }

    load(savedData: GraphData) {
        this.cy.batch(() => {
            savedData.nodes.forEach(({id, position, width, height}) => {
                this.cy
                    .add({
                        data: {
                            id,
                        },
                    })
                    .position(position)
                    .style('width', width)
                    .style('height', height)
            })
            savedData.edges.forEach(({source, target}) => {
                this.cy.add({
                    data: {
                        source,
                        target,
                    },
                })
            })
            this.cy.zoom(savedData.zoom)
            this.cy.pan(savedData.pan)
        })
    }

    cleanup() {
        this.synchronizer.resetStyles()
        // Clean up lingering handlers
        this.cy.destroy()
    }

    static async init() {
        if (!GraphVisualization.instance) {
            GraphVisualization.instance = new GraphVisualization(getCytoscapeContainer())
            // Wait for styles to finish applying, so panels have the right dimensions,
            // and cytoscape has fully instantiated
            await delay(300)
        }
    }

    static get(): GraphVisualization {
        return assumeExists(GraphVisualization.instance)
    }

    static cleanup() {
        if (GraphVisualization.instance) {
            GraphVisualization.instance.cleanup()
            removeCytoscapeContainer()
            GraphVisualization.instance = null
        }
    }
}