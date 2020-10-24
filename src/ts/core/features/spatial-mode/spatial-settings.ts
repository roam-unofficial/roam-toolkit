import {Settings} from 'src/core/settings'

const spatialSetting = (label: string, value: string) => ({
    type: 'string',
    id: `spatialGraphMode_${label}`,
    label,
    initValue: value,
})

const settingsCache: {[label: string]: string} = {}

export const SpatialSettings = {
    all: [
        spatialSetting('Width', '550px'),
        spatialSetting('Min Height', '150px'),
        spatialSetting('Max Height', '80%'),
        spatialSetting('Node Color', '#999'),
        spatialSetting('Selection Color', '#1667d3'),
        spatialSetting('Keyboard Pan Speed', '20'),
        spatialSetting('Keyboard Drag Speed', '100'),
        spatialSetting('Animation Duration (ms)', '0'),
        spatialSetting('Layout Duration (ms)', '0'),
        spatialSetting('Node Spacing', '50'),
        spatialSetting('Follow nodes on open (off/pan/panZoom)', 'pan'),
    ],

    get: (label: string) => settingsCache[label],

    panSpeed: (): number => Number.parseInt(SpatialSettings.get('Keyboard Pan Speed'), 10),
    dragSpeed: (): number => Number.parseInt(SpatialSettings.get('Keyboard Drag Speed'), 10),
    getAnimationDuration: (): number => Number.parseInt(SpatialSettings.get('Animation Duration (ms)'), 10),
    getLayoutDuration: (): number => Number.parseInt(SpatialSettings.get('Layout Duration (ms)'), 10),
    getNodeSpacing: (): number => Number.parseInt(SpatialSettings.get('Node Spacing'), 10),

    // Cache the settings when feature is activated, so we don't have to use async
    refresh: () =>
        Promise.all(
            SpatialSettings.all.map(async ({label}) => {
                settingsCache[label] = await Settings.get('spatial_graph_mode', `spatialGraphMode_${label}`)
            })
        ),
}
