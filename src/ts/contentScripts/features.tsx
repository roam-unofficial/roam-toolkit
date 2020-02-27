import {Feature, prepareSettings, Settings} from '../utils/settings'

import {config as incDec} from './inc-dec-value/index'
import {config as duplicate} from './duplicate-block-content/index'
import {config as customCss} from './custom-css/index'
import {config as srs} from './srs/index'
import {config as deleteBlock} from './delete-block/index'
import {getStateFromStorage} from '../utils/storage';
import {filterAsync, mapAsync} from '../utils/async';

export const Features = {
    all: prepareSettings([
        incDec,
        duplicate,
        customCss,
        srs,
        deleteBlock
    ]),

    isActive: async (featureId: string) => (await getStateFromStorage())[featureId].active,

    async getActiveFeatures(): Promise<Feature[]> {
        return filterAsync(this.all, (it) => this.isActive(it.id))
    },

    getShortcutHandlers: () => getAllShortcuts(Features.all)
        .reduce((acc: any, current) => {
            acc[current!.id] = current!.onPress;
            return acc
        }, {}),

    async getCurrentKeyMap() {
        const features = (await Features.getActiveFeatures()).filter(it => it.shortcuts);
        const allShortcuts = (await mapAsync(features, this.getKeyMapFor)).flat().filter(it => it[1]);
        return allShortcuts
            .reduce((acc: any, current) => {
                acc[current[0]] = current[1];
                return acc
            }, {})
    },

    async getKeyMapFor(feature: Feature) {
        return mapAsync(feature.shortcuts!, async it => [it.id, await Settings.get(feature.id, it.id)])
    }
}

export const getAllShortcuts = (features: Feature[]) =>
    features.filter(it => it.shortcuts)
        .flatMap(it => it.shortcuts);