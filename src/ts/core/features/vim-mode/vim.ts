import {blurEverything, updateBlockNavigationView} from 'src/core/features/vim-mode/vim-view'
import {getActiveEditElement} from 'src/core/common/dom'
import {Selectors} from 'src/core/roam/selectors'
import {delay, repeatAsync} from 'src/core/common/async'
import {Shortcut} from 'src/core/settings'
import {RoamPanel} from 'src/core/features/vim-mode/roam/roam-panel'
import {Keyboard} from 'src/core/common/keyboard'
import {RoamHighlight} from 'src/core/features/vim-mode/roam/roam-highlight'

export enum Mode {
    INSERT,
    VISUAL,
    NORMAL,
}

const getMode = () => {
    if (getActiveEditElement()) {
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

export const RoamVim = {
    async jumpBlocksInFocusedPanel(blocksToJump: number) {
        const mode = getMode()
        if (mode === Mode.NORMAL) {
            RoamPanel.selected().selectRelativeBlock(blocksToJump)
        }
        if (mode === Mode.VISUAL) {
            await repeatAsync(Math.abs(blocksToJump), () =>
                Keyboard.simulateKey(blocksToJump > 0 ? Keyboard.DOWN_ARROW : Keyboard.UP_ARROW, 0, {shiftKey: true})
            )
            RoamPanel.selected().scrollUntilBlockIsVisible(
                blocksToJump > 0 ? RoamHighlight.last() : RoamHighlight.first()
            )
        }
    },
}
