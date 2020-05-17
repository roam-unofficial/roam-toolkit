import {Shortcut} from '../../utils/settings'
import {updateBlockNavigationView} from './blockNavigationView'
import {isEditing} from '../../utils/dom'

const getMode = () => (isEditing() ? 'INSERT' : 'NORMAL')

type BlockNavigationModeSetting = {
    id: string
    label: string
    key: string
    onPress: () => void
}

export const map = ({id, label, key, onPress}: BlockNavigationModeSetting): Shortcut => ({
    type: 'shortcut',
    id: `blockNavigationMode_${id}`,
    label,
    initValue: key,
    onPress,
})

export const imap = (settings: BlockNavigationModeSetting): Shortcut =>
    map({
        ...settings,
        onPress: () => {
            if (getMode() == 'INSERT') {
                settings.onPress()
                updateBlockNavigationView()
            }
        },
    })

export const nmap = (settings: BlockNavigationModeSetting): Shortcut =>
    map({
        ...settings,
        onPress: () => {
            if (getMode() == 'NORMAL') {
                settings.onPress()
                updateBlockNavigationView()
            }
        },
    })
