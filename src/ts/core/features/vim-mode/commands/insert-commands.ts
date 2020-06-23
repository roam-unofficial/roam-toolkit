import {Roam} from 'SRC/core/roam/roam'
import {nmap} from 'SRC/core/features/vim-mode/vim'
import {Mouse} from 'SRC/core/common/mouse'
import {Keyboard} from 'SRC/core/common/keyboard'
import {RoamBlock} from 'SRC/core/features/vim-mode/roam/roam-block'

export const insertBlockAfter = async () => {
    await Roam.activateBlock(RoamBlock.selected().element())
    await Roam.createBlockBelow()
}

export const insertCommands = [
    nmap('i', 'Click Selection', async () => {
        await Mouse.leftClick(RoamBlock.selected().element())
        Roam.moveCursorToStart()
    }),
    nmap('a', 'Click Selection and Go-to End of Line', async () => {
        await Mouse.leftClick(RoamBlock.selected().element())
        Roam.moveCursorToEnd()
    }),
    nmap('O', 'Insert Block Before', async () => {
        await Roam.activateBlock(RoamBlock.selected().element())
        await Roam.moveCursorToStart()
        await Keyboard.pressEnter()
    }),
    nmap('o', 'Insert Block After', () => insertBlockAfter()),
]
