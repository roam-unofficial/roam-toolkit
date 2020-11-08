import {Selectors} from './selectors'
import {Mouse} from '../common/mouse'
import {BlockElement, RoamBlock} from '../features/vim-mode/roam/roam-block'

export const expandLastBreadcrumb = () => {
    const referenceItem = RoamBlock.selected().element?.closest(Selectors.referenceItem)
    const breadcrumbs = referenceItem?.querySelector(Selectors.breadcrumbsContainer)

    if (breadcrumbs?.lastElementChild) Mouse.leftClick(breadcrumbs.lastElementChild as HTMLElement)
}

export const closePageReferenceView = () => {
    const referenceItem = RoamBlock.selected().element?.closest(Selectors.pageReferenceItem)
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

    Mouse.leftClick(parentLink, shiftKey)
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
        Mouse.leftClick(mentionsButton, shiftKey)
    }
}
