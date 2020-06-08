import {browser} from 'webextension-polyfill-ts'
import {createDemo} from '../features/create-block-demo'
import {updateShortcuts} from './shortcuts'

/**
 * Be cautious to reference functions on the objects via anonymous functions (e.g. see Roam.deleteBlock)
 * Otherwise they won't be called properly on the object
 */
const dispatchMap = new Map([
    ['create-block-demo', createDemo],
    ['settings-updated', updateShortcuts],
])

browser.runtime.onMessage.addListener(command => dispatchMap.get(command)?.())
