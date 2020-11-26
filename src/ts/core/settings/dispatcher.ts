import {createDemo} from '../features/create-block-demo'
import {updateShortcuts} from './shortcuts'
import {Browser} from 'src/core/common/browser'

/**
 * Be cautious to reference functions on the objects via anonymous functions (e.g. see Roam.deleteBlock)
 * Otherwise they won't be called properly on the object
 */
const dispatchMap = new Map([
    ['create-block-demo', createDemo],
    ['settings-updated', updateShortcuts],
])

Browser.addMessageListener(command => dispatchMap.get(command)?.())
