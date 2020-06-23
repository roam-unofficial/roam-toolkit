import {nmap, returnToNormalMode} from 'src/core/features/vim-mode/vim'
import {Keyboard} from 'src/core/common/keyboard'
import {KEY_TO_CODE} from 'src/core/common/keycodes'

export const historyCommands = [
    nmap('u', 'Undo', async () => {
        await Keyboard.simulateKey(KEY_TO_CODE['z'], 0, {key: 'z', metaKey: true})
        await returnToNormalMode()
    }),
    nmap('Control+r', 'Redo', async () => {
        await Keyboard.simulateKey(KEY_TO_CODE['z'], 0, {key: 'z', shiftKey: true, metaKey: true})
        await returnToNormalMode()
    }),
]
