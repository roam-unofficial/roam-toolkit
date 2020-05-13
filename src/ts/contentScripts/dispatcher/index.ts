import {browser} from 'webextension-polyfill-ts'
import {triggerNextBucket} from '../srs'
import {guard, replaceFuzzyDate} from '../fuzzy_date'
import {createDemo} from '../create-block-demo'
import {updateShortcuts} from '../shortcuts'
import {Roam} from '../../roam/roam'
import { getFirstTopLevelBlock, getActiveEditElement } from '../../utils/dom'

/**
 * Be cautious to reference functions on the objects via anonymous functions (e.g. see Roam.deleteBlock)
 * Otherwise they won't be called properly on the object
 */
const dispatchMap = new Map([
    ['srs-next-bucket', triggerNextBucket],
    ['delete-current-block', () => Roam.deleteBlock()],
    ['duplicate-current-block', () => Roam.duplicateBlock()],
    ['replace-fuzzy-date', replaceFuzzyDate],
    ['create-block-demo', createDemo],
    ['settings-updated', updateShortcuts],
])

browser.runtime.onMessage.addListener(command => dispatchMap.get(command)?.())

const enhanceNavigation = (event: KeyboardEvent) => {
    const isEditingTitle = event.target?.parentElement instanceof HTMLHeadingElement
    const isNoBlockActive = !Roam.getActiveRoamNode()
    const isTopBlockActive = getActiveEditElement() === getFirstTopLevelBlock()

    switch (event.key) {
        case 'Enter':
            if (isEditingTitle || isNoBlockActive) {
                Roam.activateTopBlock()
            }
            break
        case 'ArrowUp':
            if (isNoBlockActive || isTopBlockActive) {
                if (event.getModifierState("Shift")) {
                    // Break to avoid interfering with block selection
                    break
                }
                Roam.activateTitle()
            }
            break
        case 'ArrowDown':
            if (isEditingTitle || isNoBlockActive) {
                if (event.getModifierState("Shift")) {
                    // Break to avoid interfering with block selection
                    break
                }
                Roam.activateTopBlock()
            }
            break
    }
}

document.addEventListener('keydown', ev => {
    // When used with 'keyup', this function fires twice. 🤔
    enhanceNavigation(ev)
})

document.addEventListener('keyup', ev => {
    if (ev.key === guard) replaceFuzzyDate()
})
