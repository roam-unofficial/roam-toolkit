import {nimap} from 'SRC/core/features/vim-mode/vim'
import {Keyboard} from 'SRC/core/common/keyboard'
import {RoamBlock} from 'SRC/core/features/vim-mode/roam/roam-block'

export const blockManipulationCommands = [
    nimap('Command+K', 'Move Block Up', async () => {
        RoamBlock.selected().focus()
        await Keyboard.simulateKey(Keyboard.UP_ARROW, 0, {metaKey: true, shiftKey: true})
    }),
    nimap('Command+J', 'Move Block Down', async () => {
        RoamBlock.selected().focus()
        await Keyboard.simulateKey(Keyboard.DOWN_ARROW, 0, {metaKey: true, shiftKey: true})
    }),
]
