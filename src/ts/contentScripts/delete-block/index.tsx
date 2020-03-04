import {Roam} from '../../utils/roam';
import {Feature, Shortcut} from '../../utils/settings'

export const config: Feature = {
    id: 'delete-block',
    name: 'Delete block',
    settings: [
        {
            type: 'shortcut',
            id: 'deleteBlock',
            label: 'Delete block shortcut',
            initValue: '',
            placeholder: 'e.g. cmd+shift+backspace',
            onPress: () => Roam.deleteBlock()
        } as Shortcut,
    ]
}