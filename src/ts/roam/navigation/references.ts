import {Selectors} from '../roam-selectors';
import {Mouse} from '../../utils/mouse';
import {selectedBlock} from '../../features/block-navigation-mode/blockNavigation';

export const expandLastBreadcrumb = () => {
    const referenceItem = selectedBlock()?.closest(Selectors.referenceItem)
    if (!referenceItem) return

    const breadcrumbs = referenceItem.querySelector(Selectors.breadcrumbsContainer)
    if (!breadcrumbs) return

    if (breadcrumbs.lastElementChild) Mouse.leftClick(breadcrumbs.lastElementChild as HTMLElement)
}