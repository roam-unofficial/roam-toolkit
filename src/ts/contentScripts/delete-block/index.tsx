import { Roam } from '../../utils/roam';
import { Feature } from '../../utils/settings'

export const config: Feature = {
    id: 'delete-block',
    name: 'Delete block',
    shortcuts: [
        {
            id: 'deleteBlock', label: 'Delete block shortcut', initValue: '', placeholder: 'e.g. cmd+shift+backspace',
            onPress: () => Roam.deleteBlock()
        }
    ]
}