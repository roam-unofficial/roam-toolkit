import { prepareSettings, Feature } from '../utils/settings'

import { config as incDec } from './inc-dec-value/index'
import { config as duplicate } from './duplicate-block-content/index'
import { config as customCss } from './custom-css/index'
import { config as srs } from './srs/index'

export const features: Feature[] = prepareSettings([
    incDec,
    duplicate,
    customCss,
    srs
])