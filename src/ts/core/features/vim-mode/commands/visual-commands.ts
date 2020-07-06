import {Mode, nmap, nvmap} from 'src/core/features/vim-mode/vim'
import {Roam} from 'src/core/roam/roam'
import {Keyboard} from 'src/core/common/keyboard'
import {RoamBlock} from 'src/core/features/vim-mode/roam/roam-block'

const highlightSelectedBlock = () => Roam.highlight(RoamBlock.selected().element)

const growHighlightUp = async (mode: Mode) => {
    if (mode === Mode.NORMAL) {
        await Roam.highlight(RoamBlock.selected().element)
    }
    await Keyboard.simulateKey(Keyboard.UP_ARROW, 0, {shiftKey: true})
}

const growHighlightDown = async (mode: Mode) => {
    if (mode === Mode.NORMAL) {
        await Roam.highlight(RoamBlock.selected().element)
    }
    await Keyboard.simulateKey(Keyboard.DOWN_ARROW, 0, {shiftKey: true})
}

export const VisualCommands = [
    nmap('v', 'Enter Visual Mode', highlightSelectedBlock),
    nvmap('shift+k', 'Grow Selection Up', growHighlightUp),
    nvmap('shift+j', 'Grow Selection Down', growHighlightDown),
]
