import cytoscape, {NodeDataDefinition, NodeSingular} from 'cytoscape'

import {assumeExists} from 'src/core/common/assert'
import {PanelElement} from 'src/core/roam/panel/roam-panel-utils'
import {RoamPanel} from 'src/core/roam/panel/roam-panel'

const getDomViewport = (): HTMLElement => assumeExists(document.querySelector('.roam-body-main')) as HTMLElement

/**
 * Responsible for updating DOM elements to match Cytoscape
 */
export class SpatialDomSynchronizer {
    // Queue position updates into batches.
    // This prevents the layout thrashing when alternating between reading/writing
    // Node positions to the DOM
    // https://developers.google.com/web/fundamentals/performance/rendering/avoid-large-complex-layouts-and-layout-thrashing
    private positionUpdates: Map<PanelElement, {left: string; top: string}>
    private cy: cytoscape.Core

    constructor(cy: cytoscape.Core) {
        this.cy = cy
        this.positionUpdates = new Map()

        const domViewport = getDomViewport()
        this.cy.on('viewport resize', () => {
            requestAnimationFrame(() => {
                domViewport.style.transform = `translate(${this.cy.pan().x}px, ${
                    this.cy.pan().y
                }px) scale(${this.cy.zoom()})`
            })
        })
        this.cy.on('position', event => this.queuePositionUpdate(event.target))
        this.cy.on('render', () => this.flushPositionUpdates())
    }

    private queuePositionUpdate(node: NodeSingular) {
        const panel = RoamPanel.getPanel(node.id())
        // Gracefully do nothing if the panel has already disappeared.
        // That way, we won't queue obsolete position updates
        // if we re-layout just before the node is removed.
        // (e.g. zooming into a block on daily notes)
        if (panel) {
            const position = assumeExists(node.position())
            this.positionUpdates.set(panel, {
                left: `${Math.round(position.x - panel.offsetWidth / 2)}px`,
                top: `${Math.round(position.y - panel.offsetHeight / 2) + 5}px`,
            })
        }
    }

    private flushPositionUpdates() {
        requestAnimationFrame(() => {
            this.positionUpdates.forEach(({left, top}, panel) => {
                panel.style.left = left
                panel.style.top = top
            })
            this.positionUpdates = new Map()
        })
    }

    private resetPanelStyles() {
        // @ts-ignore .json() is just an object in the types
        const nodes = this.cy.json().elements.nodes
        if (nodes) {
            nodes.forEach((node: NodeDataDefinition) => {
                const panel = assumeExists(RoamPanel.getPanel(assumeExists(node.data.id)))
                panel.style.removeProperty('left')
                panel.style.removeProperty('top')
            })
        }
    }

    resetStyles() {
        this.resetPanelStyles()
        const domViewport = getDomViewport()
        domViewport.style.width = '100vw'
        domViewport.style.height = 'calc(100% - 45px)'
        domViewport.style.removeProperty('transform')
    }
}
