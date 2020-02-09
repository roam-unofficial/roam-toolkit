import { Feature } from '../../utils/settings'
import { Roam } from '../../utils/roam';

export const config: Feature = {
    id: 'duplicate',
    name: 'Duplicate',
    shortcuts: [
        {
            id: 'dupShortcut', label: 'Shortcut for duplication', initValue: '',
            onPress: () => Roam.duplicateBlock()
        },
    ]
}