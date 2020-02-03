import {browser} from 'webextension-polyfill-ts';
import {triggerNextBucket} from '../srs';
import {Roam} from '../../utils/roam';

/**
 * Be cautious to reference functions on the objects via anonymous functions (e.g. see Roam.deleteBlock)
 * Otherwise they won't be called properly on the object
 */
const dispatchMap = new Map([
    ['srs-next-bucket', triggerNextBucket],
    ['delete-current-block', () => Roam.deleteBlock()]]);

browser.runtime.onMessage.addListener((command) => dispatchMap.get(command)?.());
