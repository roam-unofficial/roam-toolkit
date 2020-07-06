import {nmap, returnToNormalMode} from 'src/core/features/vim-mode/vim'
import {Keyboard} from 'src/core/common/keyboard'
import {KEY_TO_CODE} from 'src/core/common/keycodes'

const undo = async () => {
    await Keyboard.simulateKey(KEY_TO_CODE['z'], 0, {key: 'z', metaKey: true})
    await returnToNormalMode()
}

const redo = async () => {
    await Keyboard.simulateKey(KEY_TO_CODE['z'], 0, {key: 'z', shiftKey: true, metaKey: true})
    await returnToNormalMode()
}

export const HistoryCommands = [nmap('u', 'Undo', undo), nmap('ctrl+r', 'Redo', redo)]
