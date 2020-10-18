import {Settings} from 'src/core/settings'

const spatialSetting = (label: string, value: string) => ({
    type: 'string',
    id: `spatialGraphMode_${label}`,
    label,
    initValue: value,
})

const _settings: {[label: string]: string} = {}

export const GraphModeSettings = {
    all: [
        spatialSetting('Width', '550px'),
        spatialSetting('Min Height', '150px'),
        spatialSetting('Max Height', '80%'),
        spatialSetting('Node Color', '#999'),
        spatialSetting('Selection Color', '#1667d3'),
        spatialSetting('Keyboard Pan Speed', '20'),
        spatialSetting('Keyboard Drag Speed', '100'),
    ],

    get: (label: string) => _settings[label],

    // Cache the settings when feature is activated, so we don't have to use async
    refresh: () =>
        Promise.all(
            GraphModeSettings.all.map(async ({label}) => {
                _settings[label] = await Settings.get('spatial_graph_mode', `spatialGraphMode_${label}`)
            })
        ),
}
