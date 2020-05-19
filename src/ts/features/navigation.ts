import {Feature, Shortcut} from '../utils/settings'
import {Navigation} from '../roam/navigation'

export const config: Feature = {
    id: 'navigation',
    name: 'Navigation',
    settings: [
        {
            type: 'shortcut',
            id: 'goToTodayPage',
            label: 'Go to today page',
            initValue: 'ctrl+shift+`',
            onPress: () => Navigation.goToTodayPage(),
        } as Shortcut,
        {
            type: 'shortcut',
            id: 'goToNextDayPage',
            label: 'Go to next day page',
            initValue: 'ctrl+shift+ArrowUp',
            onPress: () => Navigation.goToNextDayPage(),
        } as Shortcut,
        {
            type: 'shortcut',
            id: 'goToPreviousDayPage',
            label: 'Go to previous day page',
            initValue: 'ctrl+shift+ArrowDown',
            onPress: () => Navigation.goToPreviousDayPage(),
        } as Shortcut,
    ],
}
