import {nimap} from 'src/core/features/vim-mode/vim'
import {Keyboard} from 'src/core/common/keyboard'
import {RoamBlock} from 'src/core/features/vim-mode/roam/roam-block'

const moveBlockUp = async () => {
    RoamBlock.selected().edit()
    await Keyboard.simulateKey(Keyboard.UP_ARROW, 0, {metaKey: true, shiftKey: true})
}

const moveBlockDown = async () => {
    RoamBlock.selected().edit()
    await Keyboard.simulateKey(Keyboard.DOWN_ARROW, 0, {metaKey: true, shiftKey: true})
}

export const BlockManipulationCommands = [
    nimap('command+shift+k', 'Move Block Up', moveBlockUp),
    nimap('command+shift+j', 'Move Block Down', moveBlockDown),
]
