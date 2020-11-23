import {Selectors} from 'src/core/roam/selectors'
import {Mouse} from 'src/core/common/mouse'
import {assumeExists} from 'src/core/common/assert'

import {GraphVisualization} from './graph-visualization'
import {waitForSelectionToExist} from 'src/core/common/mutation-observer'
import {RoamPanel} from 'src/core/roam/panel/roam-panel'

export const saveWorkspace = (graph: GraphVisualization) => {
    const graphData = graph.save()
    if (graphData.nodes.some(({id}) => id.includes('References to') || id.includes('block-input-'))) {
        window.alert("Saving Block Outline and References panels isn't supported yet")
    }
    const bulletsForPages = graphData.nodes.map(({id}) => `    - [[${id}]]`).join('\n')
    const graphJsonCodeBlock = '    - ```' + JSON.stringify(graphData) + '```'
    navigator.clipboard.writeText('#[[Roam Toolkit Workspace]]' + '\n' + bulletsForPages + '\n' + graphJsonCodeBlock)
}

export const restoreWorkspace = async (graph: GraphVisualization) => {
    /** assume the format of the page is:
     * - #[[Roam Toolkit Workspace]]
     *     - [[main page]]
     *     - [[side page 1]]
     *     - [[side page 2]]
     *     - ```$JSON```
     */
    const savedWorkspaceBlocks = document
        .querySelector('[data-tag="Roam Toolkit Workspace"]')
        ?.closest(Selectors.blockContainer)
    if (!savedWorkspaceBlocks) {
        return
    }
    const firstCodeBlockLine = assumeExists(
        savedWorkspaceBlocks.querySelector(`${Selectors.mainContent} .CodeMirror-line`)
    ) as HTMLElement
    const graphData = JSON.parse(firstCodeBlockLine.innerText)

    if (graphData.nodes) {
        await openAllLinksInBlocks(savedWorkspaceBlocks)
        await graph.load(graphData)
    }
}

const openAllLinksInBlocks = async (blockContainer: Element) => {
    // first, open all blocks in the page so the dom nodes exist
    const [, ...links] = Array.from(blockContainer.querySelectorAll(Selectors.link))
    // ignore the links inside complex pages
    const outerLinks = links.filter(link => !link.parentElement?.closest(Selectors.link)) as HTMLElement[]
    const [mainLink, ...sidebarLinks] = outerLinks
    // Open sidebar pages
    sidebarLinks.forEach(link => Mouse.leftClick(link, {shiftKey: true}))
    // Open main page
    Mouse.leftClick(mainLink)

    // Wait for all pages to finish opening
    await Promise.all(outerLinks.map(assertLinkWasOpened))
}

const assertLinkWasOpened = async (linkElement: HTMLElement) => {
    const panelId = assumeExists((linkElement.closest('[data-link-title]') as HTMLElement)?.dataset?.linkTitle)
    // Wait for all pages to finish opening
    await waitForSelectionToExist(() => RoamPanel.getPanel(panelId))
}
