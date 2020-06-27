import {browser} from 'webextension-polyfill-ts'
import {Feature, Settings} from '../settings'
import {injectStyle} from 'src/core/common/css'

export const config: Feature = {
    id: 'custom-css',
    name: 'Custom CSS',
    settings: [{type: 'large_string', id: 'css'}],
}

Settings.isActive(config.id).then(active => {
    if (active) {
        Settings.get(config.id, 'css').then((value: string) => {
            setCss(value)
        })
    }
})

browser.runtime.onMessage.addListener(async message => {
    if (message?.featureId === config.id) {
        setCss(message.value)
    }
})

const setCss = (css: string) => {
    injectStyle(css, 'roam-custom-styles')
}
