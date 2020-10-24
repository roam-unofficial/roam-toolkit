import {Selectors} from 'src/core/roam/selectors'
import {Mouse} from 'src/core/common/mouse'
import {assumeExists} from 'src/core/common/assert'
import {delay} from 'src/core/common/async'

import {GraphVisualization} from './graph-visualization'

export const saveWorkspace = (graph: GraphVisualization) => {
    const graphData = graph.save()
    if (graphData.nodes.some(({id}) => id.includes('Mentions of') || id.includes('block-input-'))) {
        window.alert("Saving block outline and mention panels isn't supported yet")
    }
    const bulletsForPages = graphData.nodes.map(({id}) => `- [[${id}]]`).join('\n')
    const graphJsonCodeBlock = '```' + JSON.stringify(graphData) + '```'
    navigator.clipboard.writeText(bulletsForPages + '\n' + graphJsonCodeBlock)
}

export const restoreWorkspace = async (graph: GraphVisualization) => {
    // first, open all blocks in the page so the dom nodes exist
    const links = Array.from(document.querySelectorAll(`${Selectors.mainContent} ${Selectors.block} ${Selectors.link}`))
    // ignore the links inside complex pages
    const outerLinks = links.filter(link => !link.parentElement?.closest(Selectors.link)) as HTMLElement[]
    // Open sidebar pages
    outerLinks.forEach(link => Mouse.leftClick(link, true))
    // Open main page
    Mouse.leftClick(outerLinks[0])

    /** assume the format of the page is:
     * - [[main page]]
     * - [[side page 1]]
     * - [[side page 2]]
     * ```$JSON```
     */
    const firstCodeBlockLine = assumeExists(
        document.querySelector(`${Selectors.mainContent} .CodeMirror-line`)
    ) as HTMLElement
    const graphData = JSON.parse(firstCodeBlockLine.innerText)

    // Wait for all pages to finish opening
    await delay(500 + outerLinks.length * 200)

    graph.load(graphData)
}
