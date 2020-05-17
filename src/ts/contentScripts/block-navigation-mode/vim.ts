import {Shortcut} from '../../utils/settings'
import {updateBlockNavigationView} from './blockNavigationView'
import {isEditing} from '../../utils/dom'
import {Selectors} from '../../roam/roam-selectors'

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

export const nmap = (settings: BlockNavigationModeSetting): Shortcut =>
    map({
        ...settings,
        onPress: async (mode) => {
            if (mode == 'NORMAL') {
                await settings.onPress(mode)
            }
        },
    })

export const nvmap = (settings: BlockNavigationModeSetting): Shortcut =>
    map({
        ...settings,
        onPress: async (mode) => {
            if (mode == 'NORMAL' || mode == 'VISUAL') {
                await settings.onPress(mode)
            }
        },
    })
