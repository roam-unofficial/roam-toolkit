import {Feature, Settings} from '../../utils/settings'
import {
    blurEverything,
    clearBlockNavigationView,

} from './blockNavigationView'
import {
    jumpBlocksInFocusedPanel,
    firstNativelyHighlightedBlock,
    lastNativelyHighlightedBlock,
    selectedBlock,
    state, scrollFocusedPanel, jumpUntilSelectedBlockIsVisible, scrollUntilBlockIsVisible
} from './blockNavigation'
import {Selectors} from '../../roam/roam-selectors'
import {Mouse} from '../../utils/mouse'
import {initializeBlockNavigationMode} from './blockNavigationInit'
import {map, Mode, nmap, nvmap} from './vim'
import {getHint, HINT_IDS, HINT_KEYS} from './blockNavigationHintView'
import {Roam} from '../../roam/roam'
import {Keyboard} from '../../utils/keyboard'
import {delay} from '../../utils/async'

const _jumpBlocksInFocusedPanel = async (mode: Mode, blocksToJump: number) => {
    if (mode == 'NORMAL') {
        jumpBlocksInFocusedPanel(blocksToJump)
        scrollUntilBlockIsVisible()
    }
    if (mode == 'VISUAL') {
        for (let i = 0; i < Math.abs(blocksToJump); i++) {
            // TODO figure out why simulating 50 key presses doesn't really work for visual mode
            // there's probably a better way
            await Keyboard.simulateKey(blocksToJump > 0 ? Keyboard.DOWN_ARROW : Keyboard.UP_ARROW, 0, {shiftKey: true})
        }
        scrollUntilBlockIsVisible(blocksToJump > 0 ? lastNativelyHighlightedBlock() : firstNativelyHighlightedBlock())
    }
}

async function insertBlockAfter() {
    const block = selectedBlock()
    if (block) {
        await Roam.activateBlock(block)
        await Roam.createBlockBelow()
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
            onPress: async () => {
                blurEverything()
                await delay(0)
                // Clear the native highlight you normally get after blurring a block
                blurEverything()
            },
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
            // TODO figure out why key sequences like 'g g' mess up the other shortcuts
            key: 'g',
            label: 'Select First Block',
            onPress: async () => {
                await _jumpBlocksInFocusedPanel('NORMAL', -200)
            },
        }),
        nmap({
            id: 'pageBottom',
            key: 'Shift+g',
            label: 'Select Last Block',
            onPress: async () => {
                await _jumpBlocksInFocusedPanel('NORMAL', 200)
            },
        }),
        nvmap({
            id: 'scrollUp',
            key: 'Control+y',
            label: 'Scroll Up',
            onPress: () => {
                scrollFocusedPanel(-50)
                jumpUntilSelectedBlockIsVisible()
            },
        }),
        // ctrl-e is normally used to go to the end of line, avoid messing with this
        // in insert mode
        nvmap({
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
            onPress: async () => {
                const block = selectedBlock()
                if (block) {
                    await Mouse.leftClick(block as HTMLElement)
                    Roam.moveCursorToStart()
                }
            },
        }),
        nmap({
            id: 'clickSelectionAndGotoEnd',
            key: 'a',
            label: 'Click Selection and Go-to End of Line',
            onPress: async () => {
                const block = selectedBlock()
                if (block) {
                    await Mouse.leftClick(block as HTMLElement)
                    Roam.moveCursorToEnd()
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
            id: 'insertBlockBefore',
            key: 'Shift+o',
            label: 'Insert Block Before',
            onPress: async (mode) => {
                await _jumpBlocksInFocusedPanel(mode, -1)
                await insertBlockAfter()
            },
        }),
        nmap({
            id: 'insertBlockAfter',
            key: 'o',
            label: 'Insert Block After',
            onPress: async () => {
                await insertBlockAfter()
            },
        }),
        nmap({
            id: 'toggleFold',
            key: 'z',
            label: 'Toggle Fold Block',
            onPress: async () => {
                const block = selectedBlock()
                if (block) {
                    await Roam.toggleFoldBlock(block)
                }
            },
        }),
        nmap({
            id: 'enterVisualMode',
            key: 'Shift+v',
            label: 'Enter Visual Mode',
            onPress: async () => {
                const block = selectedBlock()
                if (block) {
                    await Roam.selectBlock(block)
                    clearBlockNavigationView()
                }
            },
        }),
        nmap({
            id: 'undo',
            key: 'u',
            label: 'Undo',
            onPress: async () => {
                // z
                await Keyboard.simulateKey(90, 0, { key: 'z', metaKey: true })
            },
        }),
        nmap({
            id: 'redo',
            key: 'Control+r',
            label: 'Redo',
            onPress: async () => {
                // z
                await Keyboard.simulateKey(90, 0, { key: 'z', shiftKey: true, metaKey: true })
            },
        }),
        nmap({
            id: 'paste',
            key: 'p',
            label: 'Paste',
            onPress: async () => {
                // TODO: This doesn't work. Browsers may ban clipboard commands because they're a security vulnerability
                // The native block cut/paste uses the System's cut/paste shortcuts (the ones you can remap in Mac OSX's Keyboard preferences)
                // May have to figure out another way to cut (using the right click menu for example)
                await insertBlockAfter()
                await Keyboard.simulateKey(86, 0, { key: 'v', metaKey: true })
            },
        }),
        nmap({
            id: 'pasteBefore',
            key: 'Shift+p',
            label: 'Paste Before',
            onPress: async () => {
                // TODO: This doesn't work. Browsers may ban clipboard commands because they're a security vulnerability
                await _jumpBlocksInFocusedPanel('NORMAL', -1)
                await insertBlockAfter()
                await Keyboard.simulateKey(86, 0, { key: 'v', metaKey: true })
            },
        }),
        nvmap({
            id: 'copy',
            key: 'y',
            label: 'Copy',
            onPress: async () => {
                // TODO: This doesn't work. Browsers may ban clipboard commands because they're a security vulnerability
                await Keyboard.simulateKey(67, 0, { key: 'c', metaKey: true })
            },
        }),
        nvmap({
            id: 'cut',
            key: 'd',
            label: 'Cut',
            onPress: async () => {
                // TODO: This doesn't work. Browsers may ban clipboard commands because they're a security vulnerability
                await Keyboard.simulateKey(88, 0, { key: 'x', metaKey: true })
            },
        }),
    ].concat(
        HINT_IDS.flatMap(n => [
            nmap({
                id: `hint${n}`,
                key: HINT_KEYS[n],
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
