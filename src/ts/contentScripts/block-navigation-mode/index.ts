import {Feature, Settings, Shortcut} from '../../utils/settings'
import {
    blurEverything,
    jumpUntilSelectedBlockIsVisible,
    scrollFocusedPanel,
    scrollUntilSelectedBlockIsVisible,
    updateBlockNavigationView,
} from './blockNavigationView'
import {jumpBlocksInFocusedPanel, selectedBlock, state} from './blockNavigation'
import {Selectors} from '../../roam/roam-selectors'
import {isEditing} from '../../utils/dom'
import {Mouse} from '../../utils/mouse'
import {initializeBlockNavigationMode} from './blockNavigationInit'

const getMode = () => (isEditing() ? 'INSERT' : 'NORMAL')

type BlockNavigationModeSetting = {
    id: string
    label: string
    key: string
    onPress: () => void
}

const map = ({id, label, key, onPress}: BlockNavigationModeSetting): Shortcut => ({
    type: 'shortcut',
    id: `blockNavigationMode_${id}`,
    label,
    initValue: key,
    onPress,
})

const imap = (settings: BlockNavigationModeSetting): Shortcut =>
    map({
        ...settings,
        onPress: () => {
            if (getMode() == 'INSERT') {
                settings.onPress()
                updateBlockNavigationView()
            }
        },
    })

const nmap = (settings: BlockNavigationModeSetting): Shortcut =>
    map({
        ...settings,
        onPress: () => {
            if (getMode() == 'NORMAL') {
                settings.onPress()
                updateBlockNavigationView()
            }
        },
    })

export const config: Feature = {
    id: 'block_navigation_mode',
    name: 'Vim-like Block Navigation (Requires Refresh)',
    settings: [
        imap({
            id: 'exitToNormalMode',
            key: 'Escape',
            label: 'Exit to Normal Mode and close all popups',
            onPress: blurEverything,
        }),
        nmap({
            id: 'up',
            key: 'k',
            label: 'Select Block Up',
            onPress: () => {
                jumpBlocksInFocusedPanel(-1)
                scrollUntilSelectedBlockIsVisible()
            },
        }),
        nmap({
            id: 'down',
            key: 'j',
            label: 'Select Block Down',
            onPress: () => {
                jumpBlocksInFocusedPanel(1)
                scrollUntilSelectedBlockIsVisible()
            },
        }),
        nmap({
            id: 'pageUp',
            key: 'Control+u',
            label: 'Select Many Blocks Up',
            onPress: () => {
                jumpBlocksInFocusedPanel(-8)
                scrollUntilSelectedBlockIsVisible()
            },
        }),
        nmap({
            id: 'pageDown',
            key: 'Control+d',
            label: 'Select Many Blocks Down',
            onPress: () => {
                jumpBlocksInFocusedPanel(8)
                scrollUntilSelectedBlockIsVisible()
            },
        }),
        nmap({
            id: 'scrollUp',
            key: 'Control+y',
            label: 'Scroll Up',
            onPress: () => {
                scrollFocusedPanel(-50)
                jumpUntilSelectedBlockIsVisible()
            },
        }),
        nmap({
            id: 'scrollDown',
            key: 'Control+e',
            label: 'Scroll Down',
            onPress: () => {
                scrollFocusedPanel(50)
                jumpUntilSelectedBlockIsVisible()
            },
        }),
        nmap({
            id: 'panelLeft',
            key: 'h',
            label: 'Select Panel Left',
            onPress: () => {
                state.panel = 'MAIN'
            },
        }),
        nmap({
            id: 'panelRight',
            key: 'l',
            label: 'Select Panel Right',
            onPress: () => {
                if (document.querySelector(Selectors.sidebarContent)) {
                    state.panel = 'SIDEBAR'
                }
            },
        }),
        nmap({
            id: 'clickSelection',
            key: 'i',
            label: 'Click Selection',
            onPress: () => {
                const block = selectedBlock()
                if (block) {
                    Mouse.leftClick(block as HTMLElement)
                }
            },
        }),
        nmap({
            id: 'shiftClickSelection',
            key: 'Shift+i',
            label: 'Shift Click Selection',
            onPress: () => {
                const block = selectedBlock()
                if (block) {
                    Mouse.leftClick(block as HTMLElement, true)
                }
            },
        }),
        map({
            id: 'closeSplitPage',
            key: 'Control+w',
            label: 'Close Page in Side Bar',
            onPress: () => {
                console.log('CLOSE');
                const block = selectedBlock()
                if (block) {
                    const pageContainer = block.closest(`${Selectors.sidebarContent} > div`)
                    const closeButton = pageContainer?.querySelector(Selectors.closeButton)
                    if (closeButton) {
                        Mouse.leftClick(closeButton as HTMLElement)
                    }
                }
            },
        }),
    ],
}

Settings.isActive('block_navigation_mode').then(active => {
    if (active) {
        initializeBlockNavigationMode()
    }
})
