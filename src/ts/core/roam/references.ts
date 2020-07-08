import {Selectors} from './selectors';
import {Mouse} from '../common/mouse';
import {RoamBlock} from '../features/vim-mode/roam/roam-block';

export const expandLastBreadcrumb = () => {
    const referenceItem = RoamBlock.selected().element?.closest(Selectors.referenceItem)
    if (!referenceItem) return

    const breadcrumbs = referenceItem.querySelector(Selectors.breadcrumbsContainer)
    if (!breadcrumbs) return

    if (breadcrumbs.lastElementChild) Mouse.leftClick(breadcrumbs.lastElementChild as HTMLElement)
}