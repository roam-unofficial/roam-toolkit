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
import {restoreWorkspace, saveWorkspace} from 'src/core/features/spatial-mode/spatial-workspace'
import {Browser} from 'src/core/common/browser'

const spatialShortcut = (
    key: string,
    label: string,
    onPress: (viewport: SpatialViewport, graph: GraphVisualization) => void
): Shortcut => ({
    type: 'shortcut',
    id: `spatialMode_${label}`,
    label,
    initValue: key,
    onPress: () => {
        if (getMode() === Mode.NORMAL) {
            const graph = GraphVisualization.get()
            onPress(graph.viewport, graph)
        }
    },
})

export const config: Feature = {
    id: 'spatial_mode',
    name: 'Spatial Graph Sidebar',
    // Moving around in the graph view updates the style of the main body,
    // which makes elements reflow, due to [style*="..."] selectors applying again.
    warning: "Lags if CSS theme uses [style=*]. Auto Layout doesn't work in Firefox yet.",
    enabledByDefault: false,
    settings: [
        ...SpatialSettings.all,
        spatialShortcut('Ctrl+=', 'Zoom in', viewport => viewport.zoomBy(5 / 4)),
        spatialShortcut('Ctrl+-', 'Zoom out', viewport => viewport.zoomBy(4 / 5)),
        spatialShortcut('Ctrl+0', 'Zoom in completely', viewport => viewport.zoomIntoSelection()),
        spatialShortcut('Ctrl+9', 'Zoom out completely', viewport => viewport.zoomOutCompletely()),
        spatialShortcut('Ctrl+Command+ArrowLeft', 'Pan left', viewport => {
            viewport.panBy(-SpatialSettings.panSpeed(), 0)
        }),
        spatialShortcut('Ctrl+Command+ArrowDown', 'Pan down', viewport => {
            viewport.panBy(0, SpatialSettings.panSpeed())
        }),
        spatialShortcut('Ctrl+Command+ArrowUp', 'Pan up', viewport => {
            viewport.panBy(0, -SpatialSettings.panSpeed())
        }),
        spatialShortcut('Ctrl+Command+ArrowRight', 'Pan right', viewport => {
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
        spatialShortcut('Ctrl+Shift+s', 'Save workspace to clipboard', (_, graph) => saveWorkspace(graph)),
        spatialShortcut('Ctrl+Shift+o', 'Restore workspace from page', (_, graph) => restoreWorkspace(graph)),
    ],
}

const toggleSpatialGraphModeDependingOnSetting = () => {
    Settings.isActive('spatial_mode', config.enabledByDefault).then(active => {
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

Browser.addMessageListener(async message => {
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

        // Block the native drag and drop. It re-triggers layouts
        document.querySelectorAll(`${PANEL_SELECTOR} [draggable="true"].window-headers`).forEach(dragHandle => {
            dragHandle.setAttribute('draggable', 'false')
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
        }

        graph.viewport.ensureNodeIsSelected()
        graph.runLayout(panelChange.isInitialAdd && !previousGraphData)
    }

    graph.viewport.onSelectNode(nodeId => {
        if (isVimModeOn()) {
            const panel = assumeExists(RoamPanel.getPanel(nodeId))
            // Collapsed panels might not have any vim blocks
            if (panel.querySelector(Selectors.block)) {
                RoamVimPanel.get(panel).select()
                updateVimView()
            }
        }
    })

    const layoutAndKeepPanelInView = async (block: BlockElement) => {
        const parentPanelId = plainId(assumeExists(block.closest(PANEL_SELECTOR)).id)
        graph.viewport.selectNodeById(parentPanelId)
        await graph.runLayout()
        // Follow the just selected node, if the layout tugs the node
        // out from underneath the current viewport (e.g. due to a window resize)
        graph.viewport.panToSelectionIfNeeded()
    }

    disconnectFunctions = [
        listenToEvent('resize', () => graph.runLayout()),
        RoamEvent.onFoldBlock(() => graph.runLayout()),
        RoamEvent.onChangeBlock(layoutAndKeepPanelInView),
        RoamEvent.onEditBlock(layoutAndKeepPanelInView),
        RoamEvent.onBlurBlock(layoutAndKeepPanelInView),
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
