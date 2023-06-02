import {Selectors} from './selectors'
import {Mouse} from '../common/mouse'
import {BlockElement, RoamBlock} from '../features/vim-mode/roam/roam-block'

function expandReference(
    wrapperSelector: string,
    breadcrumbSelector: string,
    getClickElement: (parent: HTMLElement) => HTMLElement | null
) {
    const referenceItem = RoamBlock.selected().element?.closest(wrapperSelector + ',' + Selectors.inlineReference)
    const breadcrumbs = referenceItem?.querySelector(breadcrumbSelector + ',' + Selectors.zoomPath)

    const clickElement = getClickElement(breadcrumbs as HTMLElement)
    if (!clickElement) return false

    Mouse.leftClick(clickElement)
    return true
}

export const expandLastBreadcrumb = () => {
    expandReference(
        Selectors.referenceItem,
        Selectors.breadcrumbsContainer,
        breadcrumbs => breadcrumbs.lastElementChild as HTMLElement
    )

    expandReference(Selectors.inlineReference, Selectors.zoomPath, breadcrumbs => {
        const nodes = breadcrumbs.querySelectorAll(Selectors.zoomItemContent)
        return nodes[nodes.length - 1] as HTMLElement
    })
}

export const closePageReferenceView = () => {
    const referenceItem = RoamBlock.selected().element?.closest(
        Selectors.pageReferenceItem + ',' + Selectors.inlineReference
    )
    const foldButton = referenceItem?.querySelector(Selectors.foldButton)

    if (foldButton) Mouse.leftClick(foldButton as HTMLElement)
}

const parentPageLink = (blockElement: BlockElement | null): HTMLElement | null => {
    const referenceCard = blockElement?.closest(Selectors.pageReferenceItem)
    if (referenceCard) {
        return referenceCard?.querySelector(Selectors.pageReferenceLink) as HTMLElement
    }

    const panel = blockElement?.closest(`${Selectors.mainContent}, ${Selectors.sidebarPage}`)
    if (panel) {
        return panel.querySelector(Selectors.title) as HTMLElement
    }

    return null
}

export const openParentPage = (shiftKey: boolean = false) => {
    const parentLink = parentPageLink(RoamBlock.selected().element)
    if (!parentLink) {
        return
    }

    Mouse.leftClick(parentLink, {shiftKey})
}

const getMentionsButton = (blockElement: BlockElement | null): HTMLElement | null => {
    const blockMentionsButton = blockElement
        ?.closest(Selectors.blockBulletView)
        ?.querySelector('.block-ref-count-button')
    if (blockMentionsButton) {
        return blockMentionsButton as HTMLElement
    }

    const sidePanel = blockElement?.closest(Selectors.sidebarPage)
    return sidePanel?.querySelector('button.bp3-button') as HTMLElement
}

export const openMentions = (shiftKey: boolean = false) => {
    const mentionsButton = getMentionsButton(RoamBlock.selected().element)
    if (mentionsButton) {
        Mouse.leftClick(mentionsButton, {shiftKey})
    }
}
