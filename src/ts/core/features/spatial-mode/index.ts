import {browser} from 'webextension-polyfill-ts'
import {Feature, Settings, Shortcut} from 'src/core/settings'
import {waitForSelectorToExist} from 'src/core/common/mutation-observer'
import {assumeExists} from 'src/core/common/assert'
import {Mouse} from 'src/core/common/mouse'
import {DisconnectFn, listenToEvent} from 'src/core/common/event'

import {Selectors} from 'src/core/roam/selectors'
import {RoamEvent} from 'src/core/roam/roam-event'
import {PANEL_SELECTOR, plainId} from 'src/core/roam/panel/roam-panel-utils'

import {getMode, Mode} from 'src/core/features/vim-mode/vim'
import {VimRoamPanel as RoamVimPanel} from 'src/core/features/vim-mode/roam/roam-vim-panel'
import {updateVimView} from 'src/core/features/vim-mode/vim-view'
import {PanelChange, RoamPanel} from 'src/core/roam/panel/roam-panel'
import {isVimModeOn} from 'src/core/features/vim-mode/vim-init'
import {BlockElement} from 'src/core/features/vim-mode/roam/roam-block'

import {GraphData, GraphVisualization} from './graph-visualization'
import {SpatialSettings} from './spatial-settings'
import {SpatialViewport} from './spatial-viewport'

const spatialShortcut = (key: string, label: string, onPress: (graph: SpatialViewport) => void): Shortcut => ({
    type: 'shortcut',
    id: `spatialGraphMode_${label}`,
    label,
    initValue: key,
    onPress: () => {
        if (getMode() === Mode.NORMAL) {
            onPress(GraphVisualization.get().viewport)
        }
    },
})

export const config: Feature = {
    id: 'spatial_graph_mode',
    name: 'Spatial Graph Mode',
    // Moving around in the graph view updates the style of the main body,
    // which makes elements reflow, due to [style*="..."] selectors applying again.
    warning: 'Will lag if your CSS theme uses [style=*] selectors!',
    enabledByDefault: false,
    settings: [
        ...SpatialSettings.all,
        spatialShortcut('Ctrl+=', 'Zoom in', viewport => viewport.zoomBy(5 / 4)),
        spatialShortcut('Ctrl+-', 'Zoom out', viewport => viewport.zoomBy(4 / 5)),
        spatialShortcut('Ctrl+0', 'Zoom in completely', viewport => viewport.zoomBy(10)),
        spatialShortcut('Ctrl+9', 'Zoom out completely', viewport => viewport.zoomOutCompletely()),
        spatialShortcut('Ctrl+ArrowLeft', 'Pan left', viewport => {
            viewport.panBy(-SpatialSettings.panSpeed(), 0)
        }),
        spatialShortcut('Ctrl+ArrowDown', 'Pan down', viewport => {
            viewport.panBy(0, SpatialSettings.panSpeed())
        }),
        spatialShortcut('Ctrl+ArrowUp', 'Pan up', viewport => {
            viewport.panBy(0, -SpatialSettings.panSpeed())
        }),
        spatialShortcut('Ctrl+ArrowRight', 'Pan right', viewport => {
            viewport.panBy(SpatialSettings.panSpeed(), 0)
        }),
        spatialShortcut('Ctrl+Shift+h', 'Move node left', viewport => {
            viewport.dragSelectionBy(-SpatialSettings.dragSpeed(), 0)
        }),
        spatialShortcut('Ctrl+Shift+j', 'Move node down', viewport => {
            viewport.dragSelectionBy(0, SpatialSettings.dragSpeed())
        }),
        spatialShortcut('Ctrl+Shift+k', 'Move node up', viewport => {
            viewport.dragSelectionBy(0, -SpatialSettings.dragSpeed())
        }),
        spatialShortcut('Ctrl+Shift+l', 'Move node right', viewport => {
            viewport.dragSelectionBy(SpatialSettings.dragSpeed(), 0)
        }),
        spatialShortcut('Ctrl+h', 'Select left of current selection', viewport => viewport.selectLeft()),
        spatialShortcut('Ctrl+j', 'Select down of current selection', viewport => viewport.selectDown()),
        spatialShortcut('Ctrl+k', 'Select up of current selection', viewport => viewport.selectUp()),
        spatialShortcut('Ctrl+l', 'Select right of current selection', viewport => viewport.selectRight()),
    ],
}

const toggleSpatialGraphModeDependingOnSetting = () => {
    Settings.isActive('spatial_graph_mode').then(active => {
        if (active) {
            // Re-initialize if a setting changed
            let graphData
            if (GraphVisualization.instance) {
                graphData = GraphVisualization.get().save()
                stopSpatialGraphMode()
            }
            startSpatialGraphMode(graphData)
        } else {
            stopSpatialGraphMode()
        }
    })
}

browser.runtime.onMessage.addListener(async message => {
    if (message === 'settings-updated') {
        toggleSpatialGraphModeDependingOnSetting()
    }
})

toggleSpatialGraphModeDependingOnSetting()

let disconnectFunctions: DisconnectFn[] = []
const startSpatialGraphMode = async (previousGraphData?: GraphData) => {
    await SpatialSettings.refresh()
    await waitForSelectorToExist(Selectors.mainContent)
    await GraphVisualization.init()
    const graph = GraphVisualization.get()

    if (previousGraphData) {
        graph.load(previousGraphData)
    }

    const updateGraphToMatchOpenPanels = (panelChange: PanelChange) => {
        if (panelChange.renamedPanel) {
            graph.replaceNodeNames(panelChange.renamedPanel.before, panelChange.renamedPanel.after)
            // TODO do we need this return?
            return
        }

        panelChange.addedPanels?.forEach(({from, to}) => {
            graph.addNode(to, from)
        })

        panelChange.removedPanels?.forEach(panel => {
            // Only remove the panel if it's the last remaining one.
            // We don't want to remove the whole node, if it's just a dupe
            if (!RoamPanel.getPanel(panel)) {
                graph.removeNode(panel)
            }
        })

        // Avoid having identical sidebar pages open
        const redundantPanels = Array.from(document.getElementsByClassName('roam-toolkit--panel-dupe')).filter(
            panelElement => !panelElement.classList.contains('roam-toolkit--panel-dupe-main')
        )
        if (redundantPanels.length > 0) {
            redundantPanels.forEach(panel => {
                const closeButton = panel.querySelector(Selectors.closeButton)
                if (closeButton) {
                    Mouse.leftClick(closeButton as HTMLElement)
                }
            })
            // TODO do we need this return?
            // Skip re-rendering, cause the sidebar pages will change after closing the panel anyways
            return
        }

        graph.viewport.ensureNodeIsSelected()
        graph.runLayout(panelChange.isInitialAdd && !previousGraphData)
    }

    graph.viewport.onSelectNode(nodeId => {
        if (isVimModeOn()) {
            const panel = assumeExists(RoamPanel.getPanel(nodeId))
            RoamVimPanel.get(panel).select()
            updateVimView()
        }
    })

    // Follow the just selected node, if the layout tugs the node
    // out from underneath us (e.g. due to a window resize)
    const layoutWhileKeepingNodeInView = async (block: BlockElement) => {
        const parentPanelId = plainId(assumeExists(block.closest(PANEL_SELECTOR)).id)
        graph.viewport.selectNodeById(parentPanelId)
        await graph.runLayout()
        graph.viewport.panToSelectionIfNeeded()
    }

    disconnectFunctions = [
        listenToEvent('resize', () => graph.runLayout()),
        RoamEvent.onFoldBlock(() => graph.runLayout()),
        RoamEvent.onChangeBlock(layoutWhileKeepingNodeInView),
        RoamEvent.onEditBlock(layoutWhileKeepingNodeInView),
        RoamEvent.onBlurBlock(layoutWhileKeepingNodeInView),
        RoamPanel.onPanelChange(updateGraphToMatchOpenPanels),
    ]
}

/**
 * Cleaning up is very important for Spatial Mode!
 * If some handlers aren't cleaned up, zombie handlers might break
 * vim mode, or future invocations of graph mode.
 */
const stopSpatialGraphMode = () => {
    disconnectFunctions.forEach(disconnect => disconnect())
    GraphVisualization.cleanup()
}
