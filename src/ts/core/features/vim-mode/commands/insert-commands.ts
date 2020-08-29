import {Roam} from 'src/core/roam/roam'
import {nmap} from 'src/core/features/vim-mode/vim'
import {Keyboard} from 'src/core/common/keyboard'
import {RoamBlock} from 'src/core/features/vim-mode/roam/roam-block'

export const insertBlockAfter = async () => {
    await Roam.activateBlock(RoamBlock.selected().element)
    await Roam.createBlockBelow()
}

const editBlock = async () => {
    await Roam.activateBlock(RoamBlock.selected().element)
    await Roam.moveCursorToStart()
}

const editBlockFromEnd = async () => {
    await Roam.activateBlock(RoamBlock.selected().element)
    await Roam.moveCursorToEnd()
}

const insertBlockBefore = async () => {
    await Roam.activateBlock(RoamBlock.selected().element)
    await Roam.moveCursorToStart()
    await Keyboard.pressEnter()
}

export const InsertCommands = [
    nmap('i', 'Click Selection', editBlock),
    nmap('a', 'Click Selection and Go-to End of Line', editBlockFromEnd),
    nmap('shift+o', 'Insert Block Before', insertBlockBefore),
    nmap('o', 'Insert Block After', insertBlockAfter),
]
