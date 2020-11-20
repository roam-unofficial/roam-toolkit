import cytoscape, {EdgeSingular, NodeSingular} from 'cytoscape'
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
    private layout: cytoscape.Layouts | null
    private synchronizer: SpatialDomSynchronizer
    viewport: SpatialViewport

    constructor(container: HTMLElement) {
        this.cy = cytoscape({
            container,
            style: getCytoscapeStyles(),
        })
        this.layout = null
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
            !this.getEdge(fromPanel, toPanel)
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
        this.cy.promiseOn('layoutstop').then(async () => {
            const followBehavior = SpatialSettings.get('Follow nodes on open (off/pan/panZoom)')
            if (followBehavior === 'pan' || followBehavior === 'panZoom') {
                await this.viewport.panTo(toPanel, fromPanel, followBehavior)
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
        this.cy.batch(() => {
            this.cy.nodes().forEach(node => {
                const panelElement = RoamPanel.getPanel(node.id())
                if (panelElement) {
                    setStyleIfDifferentEnough(node, 'width', panelElement.offsetWidth + 10)
                    setStyleIfDifferentEnough(node, 'height', panelElement.offsetHeight + 20)
                }
            })
        });

        this.layout?.stop()
        this.layout = this.cy
            .layout({
                name: 'cola',
                fit: false,
                // @ts-ignore randomize when laying out for the first time, to avoid seizures from all the nodes being jammed on the same space
                randomize: firstRender,
                // @ts-ignore
                animate: SpatialSettings.getLayoutDuration() > 0,
                // @ts-ignore don't actually shorten the simulation, otherwise it gets stuck prematurely
                maxSimulationTime: 1000,
                // @ts-ignore instead, we skip frames
                refresh: 1000 / (SpatialSettings.getLayoutDuration() || 1),
                // @ts-ignore don't actually shorten the simulation, otherwise it gets stuck prematurely
                convergenceThreshold: SpatialSettings.getConvergenceThreshold(),
                // @ts-ignore if maxSimulationTime is too low, the layout doesn't actually run
                nodeSpacing: SpatialSettings.getNodeSpacing(),
            })
            .run() // Cola doesn't work in Firefox: https://github.com/cytoscape/cytoscape.js-cola/issues/51

        return this.waitForLayout()
    }

    private async waitForLayout() {
        if (this.layout) {
            await this.layout.promiseOn('layoutstop')
            this.layout = null
        }
    }

    private getEdge(source: string, target: string): EdgeSingular {
        return this.cy.$(`edge[source = "${source}"][target = "${target}"]`)[0]
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

    async load(savedData: GraphData) {
        this.layout?.stop()
        await this.waitForLayout()
        this.cy.batch(() => {
            savedData.nodes.forEach(({id, position, width, height}) => {
                let node = this.cy.getElementById(id)
                if (!node) {
                    node = this.cy.add({
                        data: {
                            id,
                        },
                    })
                }
                node.position(position).style('width', width).style('height', height)
            })
            savedData.edges.forEach(({source, target}) => {
                if (!this.getEdge(source, target)) {
                    this.cy.add({
                        data: {
                            source,
                            target,
                        },
                    })
                }
            })
        })
        // Stop viewport animations that may have started up after adding nodes
        this.cy.stop(true, true)
        await delay(10)

        this.cy.zoom(savedData.zoom)
        this.cy.pan(savedData.pan)
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


/**
 * Ignore 1px changes, so the panels don't flicker when you enter/exit blocks
 */
const setStyleIfDifferentEnough = (node: NodeSingular, propertyName: string, value: number) => {
    const style = node.style(propertyName)
    if (!style || Math.abs(parseInt(style, 10) - value) > 5) {
        node.style(propertyName, value)
    }
}