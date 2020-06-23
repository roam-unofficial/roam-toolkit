import {Mode, nmap, nvmap} from 'src/core/features/vim-mode/vim'
import {Roam} from 'src/core/roam/roam'
import {Keyboard} from 'src/core/common/keyboard'
import {RoamBlock} from 'src/core/features/vim-mode/roam/roam-block'

export const visualCommands = [
    nmap('v', 'Enter Visual Mode', () => Roam.selectBlock(RoamBlock.selected().element())),
    nvmap('K', 'Grow Selection Up', async mode => {
        if (mode === Mode.NORMAL) {
            await Roam.selectBlock(RoamBlock.selected().element())
        }
        await Keyboard.simulateKey(Keyboard.UP_ARROW, 0, {shiftKey: true})
    }),
    nvmap('J', 'Grow Selection Down', async mode => {
        if (mode === Mode.NORMAL) {
            await Roam.selectBlock(RoamBlock.selected().element())
        }
        await Keyboard.simulateKey(Keyboard.DOWN_ARROW, 0, {shiftKey: true})
    }),
]
