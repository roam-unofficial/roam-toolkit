import {Settings} from 'src/core/settings'

const spatialSetting = (label: string, value: string) => ({
    type: 'string',
    id: `spatialMode_${label}`,
    label,
    initValue: value,
})

const settingsCache: {[label: string]: string} = {}

export const SpatialSettings = {
    all: [
        spatialSetting('Width', '600px'),
        spatialSetting('Min Height', '200px'),
        spatialSetting('Max Height', '90%'),
        spatialSetting('Node Color', '#999'),
        spatialSetting('Selection Color', '#1667d3'),
        spatialSetting('Keyboard Pan Speed', '20'),
        spatialSetting('Keyboard Drag Speed', '100'),
        spatialSetting('Node Spacing', '50'),
        spatialSetting('Follow nodes on open (off/pan/panZoom)', 'pan'),
        spatialSetting('Pan Animation Duration (ms) or 0', '100'),
        spatialSetting('Max Layout Duration (ms) or 0 to disable', '1000'),
        spatialSetting('Layout Threshold (0-1, small is orderly)', '0.03'),
    ],

    get: (label: string) => settingsCache[label],

    panSpeed: (): number => Number.parseInt(SpatialSettings.get('Keyboard Pan Speed'), 10),
    dragSpeed: (): number => Number.parseInt(SpatialSettings.get('Keyboard Drag Speed'), 10),
    getPanDuration: (): number => Number.parseInt(SpatialSettings.get('Pan Animation Duration (ms) or 0'), 10),
    getLayoutDuration: (): number =>
        Number.parseInt(SpatialSettings.get('Max Layout Duration (ms) or 0 to disable'), 10),
    getNodeSpacing: (): number => Number.parseInt(SpatialSettings.get('Node Spacing'), 10),
    getConvergenceThreshold: (): number =>
        Number.parseFloat(SpatialSettings.get('Layout Threshold (0-1, small is orderly)')),

    // Cache the settings when feature is activated, so we don't have to use async
    refresh: () =>
        Promise.all(
            SpatialSettings.all.map(async ({label}) => {
                settingsCache[label] = await Settings.get('spatial_mode', `spatialMode_${label}`)
            })
        ),
}
