import {Feature, Settings} from '../../utils/settings'
import {
    blurEverything,
    clearBlockNavigationView,
    jumpUntilSelectedBlockIsVisible,
    scrollFocusedPanel,
    scrollUntilBlockIsVisible,
} from './blockNavigationView'
import {
    jumpBlocksInFocusedPanel,
    firstNativelyHighlightedBlock,
    lastNativelyHighlightedBlock,
    selectedBlock,
    state,
} from './blockNavigation'
import {Selectors} from '../../roam/roam-selectors'
import {Mouse} from '../../utils/mouse'
import {initializeBlockNavigationMode} from './blockNavigationInit'
import {map, Mode, nmap, nvmap} from './vim'
import {getHint, HINTS} from './blockNavigationHintView'
import {Roam} from '../../roam/roam'
import {Keyboard} from '../../utils/keyboard'

const _jumpBlocksInFocusedPanel = async (mode: Mode, blocksToJump: number) => {
    if (mode == 'NORMAL') {
        jumpBlocksInFocusedPanel(blocksToJump)
        scrollUntilBlockIsVisible()
    }
    if (mode == 'VISUAL') {
        for (let i = 0; i < Math.abs(blocksToJump); i++) {
            await Keyboard.simulateKey(blocksToJump > 0 ? Keyboard.DOWN_ARROW : Keyboard.UP_ARROW, 0, {shiftKey: true})
        }
        scrollUntilBlockIsVisible(blocksToJump > 0 ? lastNativelyHighlightedBlock() : firstNativelyHighlightedBlock())
    }
}

export const config: Feature = {
    id: 'block_navigation_mode',
    name: 'Vim-like Block Navigation (Requires Refresh)',
    settings: [
        map({
            id: 'exitToNormalMode',
            key: 'Escape',
            label: 'Exit to Normal Mode and close all popups',
            onPress: blurEverything,
        }),
        nvmap({
            id: 'up',
            key: 'k',
            label: 'Select Block Up',
            onPress: async mode => {
                await _jumpBlocksInFocusedPanel(mode, -1)
            },
        }),
        nvmap({
            id: 'down',
            key: 'j',
            label: 'Select Block Down',
            onPress: async mode => {
                await _jumpBlocksInFocusedPanel(mode, 1)
            },
        }),
        nmap({
            id: 'pageUp',
            key: 'Control+u',
            label: 'Select Many Blocks Up',
            onPress: async mode => {
                await _jumpBlocksInFocusedPanel(mode, -8)
            },
        }),
        nmap({
            id: 'pageDown',
            key: 'Control+d',
            label: 'Select Many Blocks Down',
            onPress: async mode => {
                await _jumpBlocksInFocusedPanel(mode, 8)
            },
        }),
        nmap({
            id: 'pageTop',
            key: 'g', // key sequences like 'g g' mess up the other shortcuts for some reason
            label: 'Select First Block',
            onPress: async mode => {
                await _jumpBlocksInFocusedPanel(mode, -50)
            },
        }),
        nmap({
            id: 'pageBottom',
            key: 'Shift+g',
            label: 'Select Last Block',
            onPress: async mode => {
                await _jumpBlocksInFocusedPanel(mode, 50)
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
            updateView: false,
            onPress: () => {
                console.log('CLOSE')
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
        nmap({
            id: 'insertBlockAfter',
            key: 'o',
            label: 'Insert Block After',
            onPress: async () => {
                const block = selectedBlock()
                if (block) {
                    await Roam.activateBlock(block)
                    await Roam.createBlockBelow()
                }
            },
        }),
        nmap({
            id: 'enterVisualMode',
            key: 'v',
            label: 'Enter Visual Mode',
            onPress: async () => {
                const block = selectedBlock()
                if (block) {
                    await Roam.selectBlock(block)
                    clearBlockNavigationView()
                }
            },
        }),
    ].concat(
        HINTS.flatMap(n => [
            nmap({
                id: `hint${n}`,
                key: n.toString(),
                label: `Click Hint ${n}`,
                onPress: () => {
                    const hint = getHint(n)
                    if (hint) {
                        Mouse.leftClick(hint)
                    }
                },
            }),
            nmap({
                id: `hint${n}Shift`,
                key: `Shift+${n.toString()}`,
                label: `Shift Click Hint ${n}`,
                onPress: () => {
                    const hint = getHint(n)
                    if (hint) {
                        Mouse.leftClick(hint, true)
                    }
                },
            }),
        ])
    ),
}

Settings.isActive('block_navigation_mode').then(active => {
    if (active) {
        initializeBlockNavigationMode()
    }
})
