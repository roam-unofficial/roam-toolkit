import {Selectors} from './selectors'
import {Mouse} from '../common/mouse'
import {RoamBlock} from '../features/vim-mode/roam/roam-block'

export const expandLastBreadcrumb = () => {
    const referenceItem = RoamBlock.selected().element?.closest(Selectors.referenceItem)
    const breadcrumbs = referenceItem?.querySelector(Selectors.breadcrumbsContainer)

    if (breadcrumbs?.lastElementChild) Mouse.leftClick(breadcrumbs.lastElementChild as HTMLElement)
}

export const closePageReferenceView = () => {
    const referenceItem = RoamBlock.selected().element?.closest(Selectors.pageReferenceItem)
    const caretButton = referenceItem?.querySelector(Selectors.caretButton)

    if (caretButton) Mouse.leftClick(caretButton as HTMLElement)
}
