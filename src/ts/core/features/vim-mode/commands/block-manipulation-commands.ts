import {nimap} from 'src/core/features/vim-mode/vim'
import {Keyboard} from 'src/core/common/keyboard'
import {RoamBlock} from 'src/core/features/vim-mode/roam/roam-block'

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
