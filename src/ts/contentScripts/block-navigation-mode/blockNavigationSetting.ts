import {Settings} from '../../utils/settings'

export const getBlockNavigationModeSetting = (settingId: string) => Settings.get(
    'block_navigation_mode',
    `blockNavigationMode_${settingId}`
)