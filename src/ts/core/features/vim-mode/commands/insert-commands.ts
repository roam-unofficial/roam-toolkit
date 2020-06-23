import {Roam} from 'src/core/roam/roam'
import {nmap} from 'src/core/features/vim-mode/vim'
import {Mouse} from 'src/core/common/mouse'
import {Keyboard} from 'src/core/common/keyboard'
import {RoamBlock} from 'src/core/features/vim-mode/roam/roam-block'

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
