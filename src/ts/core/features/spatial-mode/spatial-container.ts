import {injectStyle} from 'src/core/common/css'

import {SpatialSettings} from './spatial-settings'
import {PANEL_SELECTOR} from 'src/core/roam/panel/roam-panel-utils'
import {Selectors} from 'src/core/roam/selectors'

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
        ${Selectors.sidebar}, ${Selectors.sidebar} > div {
            background-color: transparent;
        }
        ${Selectors.sidebar} > div:first-child, /* sidebar toggle */
        #buffer, /* help icon in the bottom right */
        .roam-toolkit--panel-dupe /* extra sidebar panels that match the main panel */ {
            display: none !important;
        }
        /* remove horizontal dividers between sidebar pages */
        .sidebar-content > div > div {
            border: none !important;
        }
        /* hide sidebar toggle icon */
        ${Selectors.sidebar} .bp3-icon-menu-open {
            display: none;
        }

        /* Make the whole app click-through-able, so we can pan/zoom Cytoscape */
        #app {
            pointer-events: none;
        }
        /* But make the actual content itself clickable */
        ${Selectors.leftPanel}, .roam-topbar, ${PANEL_SELECTOR} {
            pointer-events: auto;
        }

        /* The container that holds everything */
        ${Selectors.mainBody}, ${Selectors.sidebar} {
            transform-origin: 0 0; /* match Cytoscape's zoom origin */
            transition: none !important; /* otherwise the sidebar pages lag when panning */
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            right: 0 !important;
            bottom: 0 !important;
            padding: 0 !important;
            margin: 0 !important;
        }
        ${Selectors.mainBody} ${PANEL_SELECTOR} {
            /* cancel out margins that custom themes might add */
            margin: 0 !important;
        }
        ${PANEL_SELECTOR} {
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
            /* For some reason, the text sometimes gets blurry without this */
            transform: translateZ(0);
        }
        ${Selectors.topBar} {
            position: fixed !important;
        }
        ${Selectors.sidebarScrollContainer} {
            /* Otherwise the panels get cut off when using Roam42 */
            overflow: visible !important;
            position: initial !important;
        }
        ${Selectors.sidebar} > div {
            /* Some themes set a background, like Leyendecker */
            background-color: transparent !important;
            border: none !important;
        }
        /* The innermost sidebar div plays best with custom themes */
        ${Selectors.sidebarContent} ${PANEL_SELECTOR} {
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
