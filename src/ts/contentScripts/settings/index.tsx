import { browser } from 'webextension-polyfill-ts';
import { getSetting, isActive, Feature, Setting } from '../../utils/settings';
import { features } from '../features'


export const isShortcutPressed = (shortcut: string, event: KeyboardEvent) => {
    let ctrlKey = false;
    let altKey = false;
    let shiftKey = false;
    let metaKey = false;
    let key: boolean | string = false;
    const keyList: string[] = shortcut.split(/\s*\+\s*/);

    for (let k of keyList) {
        k = k.toLocaleLowerCase()
        if (k === 'ctrl' || k === 'control') { ctrlKey = true; continue; }
        if (k === 'alt' || k === 'option') { altKey = true; continue; }
        if (k === 'shift') { shiftKey = true; continue; }
        if (k === 'cmd' || k === 'command') { metaKey = true; continue; }
        key = k;
    }
    if (!key) {
        return;
    }

    if (ctrlKey && !event.ctrlKey) return;
    if (altKey && !event.altKey) return;
    if (shiftKey && !event.shiftKey) return;
    if (metaKey && !event.metaKey) return;
    if (event.key.toLocaleLowerCase() === key) {
        return true;
    }
    return;
}

export const onShortcutPress = (shortcut: string, action: () => void) => {
    document.addEventListener('keydown', (event: KeyboardEvent) => {
        if (isShortcutPressed(shortcut, event)) {
            event.preventDefault();
            action();
        }
    })
}



features.map((feature: Feature) => {
    feature.settings.map(async (setting: Setting) => {
        if (setting.type === 'shortcut' && await isActive(feature.id)) {
            getSetting(feature.id, setting.id).then((shortcut: any) => {
                if (shortcut !== '') {
                    onShortcutPress(shortcut, setting.onPress);
                }
            })
        }
    })
})

browser.runtime.onMessage.addListener(async (message) => {
    if (message.shortcut !== '') {
        const feature = features.find((f: Feature) => f.id === message.featureId)
        const setting = feature?.settings.find((s: Setting) => s.id === message.settingId)
        if (feature && setting?.type === 'shortcut' && await isActive(feature.id)) {
            onShortcutPress(message.shortcut, setting.onPress)
        }
    }
})


