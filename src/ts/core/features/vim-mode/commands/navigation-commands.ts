import {nmap, nvmap, RoamVim} from 'src/core/features/vim-mode/vim'
import {RoamPanel} from 'src/core/features/vim-mode/roam/roam-panel'

const selectFirstBlock = () => {
    const panel = RoamPanel.selected()
    panel.selectBlock(panel.firstBlock().id)
}

const selectLastBlock = () => {
    const panel = RoamPanel.selected()
    panel.selectBlock(panel.lastBlock().id)
}

export const NavigationCommands = [
    nvmap('k', 'Select Block Up', () => RoamVim.jumpBlocksInFocusedPanel(-1)),
    nvmap('j', 'Select Block Down', () => RoamVim.jumpBlocksInFocusedPanel(1)),
    nmap('g g', 'Select First Block', selectFirstBlock),
    nmap('shift+g', 'Select Last Block', selectLastBlock),
    nmap('ctrl+u', 'Select Many Blocks Up', () => RoamVim.jumpBlocksInFocusedPanel(-8)),
    nmap('ctrl+d', 'Select Many Blocks Down', () => RoamVim.jumpBlocksInFocusedPanel(8)),
    nvmap('ctrl+y', 'Scroll Up', () => RoamPanel.selected().scrollAndReselectBlockToStayVisible(-50)),
    // Avoid insert mode, to allow native ctrl-e to go to end of line
    nvmap('ctrl+e', 'Scroll Down', () => RoamPanel.selected().scrollAndReselectBlockToStayVisible(50)),
]
