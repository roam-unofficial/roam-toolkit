import {browser} from 'webextension-polyfill-ts'
import {triggerNextBucket} from '../srs'
import {guard, replaceFuzzyDate} from '../fuzzy_date'
import {createDemo} from '../create-block-demo'
import {updateShortcuts} from '../shortcuts'
import {Roam} from '../../roam/roam'

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

/**
 * We use `keypress`, since `keyup` is sometimes firing for individual keys instead of the pressed key 
 * when the guard character is requiring a multi-key stroke.
 *
 * `setTimeout` is used to put the callback to the end of the event queue, 
 * since the input is not yet changed when keypress is firing.
 */
document.addEventListener('keypress', ev => {
    if (ev.key === guard) setTimeout(replaceFuzzyDate, 0)
})
