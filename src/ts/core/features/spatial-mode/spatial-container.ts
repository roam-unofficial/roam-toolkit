import {injectStyle} from 'src/core/common/css'

import {SpatialSettings} from './spatial-settings'
import {PANEL_CSS_CLASS} from 'src/core/roam/panel/roam-panel-utils'

const SPATIAL_MASK_ID = 'roam-toolkit-spatial-mode--mask'
const SPATIAL_MODE_CSS_ID = 'roam-toolkit-spatial-mode'

export const removeCytoscapeContainer = () => {
    document.getElementById(SPATIAL_MODE_CSS_ID)?.remove()
    document.getElementById(SPATIAL_MASK_ID)?.remove()
}

/**
 * - The cytoscape container is behind the rest of Roam
 * - Roam's is click-through-able (via pointer-events: none),
 *   so you can click/drag the cytoscape visualization
 * - Roam panels, and other interactive components are not click-through-able
 */
export const getCytoscapeContainer = () => {
    const spatialElement = document.createElement('div')
    spatialElement.id = SPATIAL_MASK_ID
    document.body.prepend(spatialElement)

    injectStyle(
        `
        #${SPATIAL_MASK_ID} {
            position: fixed;
            left: 0;
            right: 0;
            top: 0;
            bottom: 0;
        }

        /* REMOVE UI CRUFT */
        #right-sidebar {
            background-color: transparent;
        }
        #right-sidebar > div:first-child, /* sidebar toggle */
        #buffer, /* help icon in the bottom right */
        .roam-toolkit--panel-dupe /* extra sidebar panels that match the main panel */ {
            display: none !important;
        }
        /* remove horizontal dividers between sidebar pages */
        .sidebar-content > div > div {
            border: none !important;
        }

        /* Make the whole app click-through-able, so we can pan/zoom Cytoscape */
        #app {
            pointer-events: none;
        }
        /* But make the actual content itself clickable */
        .roam-sidebar-container, .roam-topbar, .roam-toolkit--panel {
            pointer-events: auto;
        }

        /* The container that holds everything */
        .roam-main .roam-body-main {
            /* match Cytoscape's zoom origin */
            transform-origin: 0 0;
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            right: 0 !important;
            bottom: 0 !important;
            padding: 0 !important;
            margin: 0 !important;
        }
        .roam-center {
            /* cancel position: static on the main panel */
            position: initial;
        }
        .roam-center .${PANEL_CSS_CLASS} {
            /* cancel out margins that custom themes might add */
            margin: 0 !important;
        }
        .${PANEL_CSS_CLASS} {
            /* min-width doesn't really work, it jams up against #roam-right-sidebar-content */
            width: ${SpatialSettings.get('Width')} !important;
            height: auto !important; /* prevent the main panel from stretching 100% */
            min-height: ${SpatialSettings.get('Min Height')} !important;
            max-height: ${SpatialSettings.get('Max Height')} !important;
            border-radius: 5px;
            position: absolute !important;
            background: white;
            overflow-y: scroll !important;
            margin: 0 !important;
        }
        /* The innermost sidebar div plays best with custom themes */
        .sidebar-content .${PANEL_CSS_CLASS} {
            padding: 0 16px !important;
        }
        /* The innermost main div plays best with custom themes */
        .roam-center > div {
            overflow: visible !important;
        }
        /* Indicate when a main panel's edges are anchored by a hidden sidebar*/
        .roam-toolkit--panel-anchored::before {
            content: "⚓";
            left: 6px;
            top: 6px;
            position: absolute;
        }
        `,
        SPATIAL_MODE_CSS_ID
    )

    return spatialElement
}
