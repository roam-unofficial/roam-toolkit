import {browser} from 'webextension-polyfill-ts';
import {triggerNextBucket} from '../srs';
import {guard, replaceFuzzyDate} from '../fuzzy_date';
import {createDemo} from '../create-block-demo'
import {updateShortcuts} from '../shortcuts';
import {Roam} from '../../roam/roam';

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
]);

browser.runtime.onMessage.addListener((command) => dispatchMap.get(command)?.());

document.addEventListener('keydown', ev => {
    const enter = 'Enter';
    const isExitingTitle = (ev: KeyboardEvent) => {
        return ev.target.parentElement instanceof HTMLHeadingElement;
    }
    const isNoBlockSelected = (ev: KeyboardEvent) => {
        return ev.target instanceof HTMLBodyElement;
    }

    if (ev.key === enter && (isExitingTitle(ev) || isNoBlockSelected(ev))) {
        Roam.createBlockAtTop();
    }
});

document.addEventListener('keyup', ev => {
    if (ev.key === guard) replaceFuzzyDate();
});