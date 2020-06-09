import {Shortcut} from '../../settings'
import {blurEverything, updateBlockNavigationView} from './blockNavigationView'
import {isEditing} from '../../common/dom'
import {Selectors} from '../../roam/roam-selectors'
import {delay} from '../../common/async'

export type Mode = 'INSERT' | 'VISUAL' | 'NORMAL'

export const getMode = () => {
    if (isEditing()) {
        return 'INSERT'
    }

    if (document.querySelector(Selectors.highlight)) {
        return 'VISUAL'
    }

    return 'NORMAL'
}

type BlockNavigationModeSetting = {
    id: string
    label: string
    key: string
    updateView?: boolean,
    onPress: (mode: Mode) => void
}

export const returnToNormalMode = async () => {
    blurEverything()
    await delay(0)
    // Clear the native highlight you normally get after blurring a block
    blurEverything()
}

export const map = ({id, label, key, onPress, updateView = true }: BlockNavigationModeSetting): Shortcut => ({
    type: 'shortcut',
    id: `blockNavigationMode_${id}`,
    label,
    initValue: key,
    onPress: async () => {
        await onPress(getMode())
        if (updateView) {
            updateBlockNavigationView()
        }
    },
})

export const imap = (settings: BlockNavigationModeSetting): Shortcut =>
    map({
        ...settings,
        onPress: async (mode) => {
            if (mode === 'INSERT') {
                await settings.onPress(mode)
            }
        },
    })

export const vmap = (settings: BlockNavigationModeSetting): Shortcut =>
    map({
        ...settings,
        onPress: async (mode) => {
            if (mode === 'VISUAL') {
                await settings.onPress(mode)
            }
        },
    })

export const nmap = (settings: BlockNavigationModeSetting): Shortcut =>
    map({
        ...settings,
        onPress: async (mode) => {
            if (mode === 'NORMAL') {
                await settings.onPress(mode)
            }
        },
    })

export const nimap = (settings: BlockNavigationModeSetting): Shortcut =>
    map({
        ...settings,
        onPress: async (mode) => {
            if (mode === 'NORMAL' || mode === 'INSERT') {
                await settings.onPress(mode)
            }
        },
    })

export const nvmap = (settings: BlockNavigationModeSetting): Shortcut =>
    map({
        ...settings,
        onPress: async (mode) => {
            if (mode === 'NORMAL' || mode === 'VISUAL') {
                await settings.onPress(mode)
            }
        },
    })
