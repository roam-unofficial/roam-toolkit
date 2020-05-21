import {Feature, Settings} from '../../utils/settings'
import {clearBlockNavigationView} from './blockNavigationView'
import {
    firstNativelyHighlightedBlock,
    jumpBlocksInFocusedPanel,
    jumpUntilSelectedBlockIsVisible,
    lastNativelyHighlightedBlock,
    scrollFocusedPanel,
    scrollUntilBlockIsVisible,
    selectedBlock,
    selectedBlockId,
    state,
} from './blockNavigation'
import {Selectors} from '../../roam/roam-selectors'
import {Mouse} from '../../utils/mouse'
import {initializeBlockNavigationMode} from './blockNavigationInit'
import {map, Mode, nimap, nmap, nvmap, returnToNormalMode} from './vim'
import {getHint, HINT_IDS, HINT_KEYS} from './blockNavigationHintView'
import {Roam} from '../../roam/roam'
import {Keyboard} from '../../utils/keyboard'
import {KEY_TO_SHIFTED} from '../../utils/react-hotkeys'
import {copyBlockEmbed, copyBlockReference} from '../../roam/roam-block'

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
    enabledByDefault: false,
    settings: [
        map({
            id: 'exitToNormalMode',
            key: 'Escape',
            label: 'Exit to Normal Mode and close all popups',
            onPress: returnToNormalMode,
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
            key: 'G',
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
            key: 'O',
            label: 'Insert Block Before',
            onPress: async () => {
                const block = selectedBlock()
                if (block) {
                    await Roam.activateBlock(block)
                    await Roam.moveCursorToStart()
                    await Keyboard.pressEnter()
                }
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
            key: 'V',
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
                await Keyboard.simulateKey(90, 0, {key: 'z', metaKey: true})
                await returnToNormalMode()
            },
        }),
        nmap({
            id: 'redo',
            key: 'Control+r',
            label: 'Redo',
            onPress: async () => {
                await Keyboard.simulateKey(90, 0, {key: 'z', shiftKey: true, metaKey: true})
                await returnToNormalMode()
            },
        }),
        nmap({
            id: 'paste',
            key: 'p',
            label: 'Paste',
            onPress: async () => {
                await insertBlockAfter()
                document.execCommand('paste')
                await returnToNormalMode()
            },
        }),
        nmap({
            id: 'pasteBefore',
            key: 'P',
            label: 'Paste Before',
            onPress: async () => {
                await _jumpBlocksInFocusedPanel('NORMAL', -1)
                await insertBlockAfter()
                document.execCommand('paste')
                await returnToNormalMode()
            },
        }),
        nvmap({
            id: 'copy',
            key: 'y',
            label: 'Copy',
            onPress: async mode => {
                const block = selectedBlock()
                if (mode === 'NORMAL' && block) {
                    await Roam.selectBlock(block)
                }
                document.execCommand('copy')
                await returnToNormalMode()
            },
        }),
        nvmap({
            id: 'copyBlockRef',
            key: 'Alt+y',
            label: 'Copy Block Reference',
            onPress: () => copyBlockReference(selectedBlockId()),
        }),
        nvmap({
            id: 'copyBlockEmbed',
            key: 'Y',
            label: 'Copy Block Embed',
            onPress: () => copyBlockEmbed(selectedBlockId()),
        }),
        nvmap({
            id: 'cut',
            key: 'd',
            label: 'Cut',
            onPress: async mode => {
                const block = selectedBlock()
                if (mode === 'NORMAL' && block) {
                    await Roam.selectBlock(block)
                }
                document.execCommand('cut')
                await returnToNormalMode()
            },
        }),
        nvmap({
            id: 'selectUp',
            key: 'K',
            label: 'Grow Selection Up',
            onPress: async mode => {
                const block = selectedBlock()
                if (mode === 'NORMAL' && block) {
                    await Roam.selectBlock(block)
                }
                await Keyboard.simulateKey(Keyboard.UP_ARROW, 0, {shiftKey: true})
            },
        }),
        nvmap({
            id: 'selectDown',
            key: 'J',
            label: 'Grow Selection Down',
            onPress: async mode => {
                const block = selectedBlock()
                if (mode === 'NORMAL' && block) {
                    await Roam.selectBlock(block)
                }
                await Keyboard.simulateKey(Keyboard.DOWN_ARROW, 0, {shiftKey: true})
            },
        }),
        nimap({
            id: 'moveBlockUp',
            key: 'Command+K',
            label: 'Move Block Up',
            onPress: async () => {
                const block = selectedBlock()
                if (block) {
                    await Roam.activateBlock(block)
                    await Keyboard.simulateKey(Keyboard.UP_ARROW, 0, {metaKey: true, shiftKey: true})
                }
            },
        }),
        nimap({
            id: 'moveBlockDown',
            key: 'Command+J',
            label: 'Move Block Up',
            onPress: async () => {
                const block = selectedBlock()
                if (block) {
                    await Roam.activateBlock(block)
                    await Keyboard.simulateKey(Keyboard.DOWN_ARROW, 0, {metaKey: true, shiftKey: true})
                }
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
                key: `${KEY_TO_SHIFTED[HINT_KEYS[n]]}`,
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

// Don't trigger the single letter shortcuts when pressing native keybindings such as "cmd+u".
// See https://github.com/greena13/react-hotkeys/issues/234#issuecomment-612687273
export const nativeKeyBindingsToIgnore: string[] = [
    'command+c',
    'command+a',
    'command+v',
    'command+x',
    'command+u',
];

Settings.isActive('block_navigation_mode').then(active => {
    if (active) {
        initializeBlockNavigationMode()
    }
})
