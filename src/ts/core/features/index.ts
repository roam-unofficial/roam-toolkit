import {Dictionary} from 'lodash'

import {Feature, prepareSettings, Settings, Shortcut} from '../settings'

import {config as incDec} from './inc-dec-value'
import {config as srs} from '../srs/srs'
import {config as blockManipulation} from './block-manipulation'
import {config as vimMode} from './vim-mode'
import {config as spatialMode} from './spatial-mode'
import {config as estimate} from './estimates'
import {config as navigation} from './navigation'
import {config as livePreview} from './livePreview'
import {config as dateTitle} from './day-title'
import {config as fuzzyDate} from './fuzzy_date'
import {config as randomPage} from './random-page'
import {filterAsync, mapAsync} from '../common/async'
import {Handler} from 'src/core/react-hotkeys/key-handler'
import {KeySequenceString} from 'src/core/react-hotkeys/key-sequence'
import {combineReducers, createStore, Store} from 'redux';
import {IAppState} from 'src/background/store';
import settings from 'src/background/store/settings/reducer';
import {getStateFromStorage, saveStateToStorage} from 'src/core/common/storage';

export const Features = {
    all: prepareSettings([
        incDec, // prettier
        srs,
        blockManipulation,
        vimMode,
        spatialMode,
        estimate,
        navigation,
        dateTitle,
        fuzzyDate,
        livePreview,
        randomPage,
    ]),

    isActive: Settings.isActive,

    async getActiveFeatures(): Promise<Feature[]> {
        return filterAsync(this.all, it => this.isActive(it.id))
    },

    getShortcutHandlers: (): Dictionary<Handler> =>
        getAllShortcuts(Features.all).reduce((acc: any, current) => {
            acc[current.id] = current.onPress
            return acc
        }, {}),

    async getCurrentKeyMap(): Promise<Dictionary<KeySequenceString>> {
        const features = (await Features.getActiveFeatures()).filter(it => it.settings)
        const allShortcuts = (await mapAsync(features, this.getKeyMapFor)).flat().filter(it => it[1])
        return allShortcuts.reduce((acc: any, current) => {
            acc[current[0]] = current[1]
            return acc
        }, {})
    },

    async getKeyMapFor(feature: Feature) {
        return mapAsync(feature.settings!, async it => [it.id, await Settings.get(feature.id, it.id)])
    },
}

export const getAllShortcuts = (features: Feature[]): Shortcut[] =>
    features
        .filter(it => it.settings)
        .flatMap(it => it.settings)
        .filter(it => it!.type === 'shortcut')
        .map(it => it as Shortcut)

export const reducers = combineReducers<IAppState>({
    ...Features.all.map((f: any) => ({[f.id]: f.reducer})).reduce((r: any, c: any) => Object.assign(r, c), {}),
    settings,
})

const store: Store<IAppState> = createStore(reducers, getStateFromStorage())
store.subscribe(() => saveStateToStorage(store.getState()))
store.dispatch({type: 'load_defaults_dummy'})
