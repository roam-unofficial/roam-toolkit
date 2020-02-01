import {browser} from 'webextension-polyfill-ts';
import {triggerNextBucket} from '../srs';

const dispatchMap = new Map([['srs-next-bucket', triggerNextBucket]]);

browser.runtime.onMessage.addListener((command) => dispatchMap.get(command)?.());
