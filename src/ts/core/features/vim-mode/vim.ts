import {blurEverything, updateBlockNavigationView} from 'SRC/core/features/vim-mode/vim-view'
import {isEditing} from 'SRC/core/common/dom'
import {Selectors} from 'SRC/core/roam/selectors'
import {delay, repeatAsync} from 'SRC/core/common/async'
import {Shortcut} from 'SRC/core/settings'
import {RoamPanel} from 'SRC/core/features/vim-mode/roam/roam-panel'
import {Keyboard} from 'SRC/core/common/keyboard'
import {RoamHighlight} from 'SRC/core/features/vim-mode/roam/roam-highlight'

export enum Mode {
    INSERT,
    VISUAL,
    NORMAL,
}

const getMode = () => {
    if (isEditing()) {
        return Mode.INSERT
    }

    if (document.querySelector(Selectors.highlight)) {
        return Mode.VISUAL
    }

    return Mode.NORMAL
}

export const returnToNormalMode = async () => {
    blurEverything()
    await delay(0)
    // Clear the native highlight you normally get after blurring a block
    blurEverything()
}

type CommandMapper = (key: string, label: string, onPress: (mode: Mode) => void) => Shortcut

const _map = (modes: Mode[]): CommandMapper => (key, label, onPress) => ({
    type: 'shortcut',
    id: `blockNavigationMode_${label}`,
    label,
    initValue: key,
    onPress: async () => {
        const mode = getMode()
        if (modes.includes(mode)) {
            await onPress(getMode())
            updateBlockNavigationView()
        }
    },
})

export const map: CommandMapper = _map([Mode.NORMAL, Mode.VISUAL, Mode.INSERT])
export const nmap: CommandMapper = _map([Mode.NORMAL])
export const nimap: CommandMapper = _map([Mode.NORMAL, Mode.INSERT])
export const nvmap: CommandMapper = _map([Mode.NORMAL, Mode.VISUAL])

export const jumpBlocksInFocusedPanel = async (mode: Mode, blocksToJump: number) => {
    if (mode === Mode.NORMAL) {
        RoamPanel.selected().selectRelativeBlock(blocksToJump)
    }
    if (mode === Mode.VISUAL) {
        await repeatAsync(Math.abs(blocksToJump), () =>
            Keyboard.simulateKey(blocksToJump > 0 ? Keyboard.DOWN_ARROW : Keyboard.UP_ARROW, 0, {shiftKey: true})
        )
        RoamPanel.selected().scrollUntilBlockIsVisible(
            blocksToJump > 0 ? RoamHighlight.lastBlockElement() : RoamHighlight.firstBlockElement()
        )
    }
}