import {jumpBlocksInFocusedPanel, nmap, nvmap} from 'src/core/features/vim-mode/vim'
import {RoamPanel} from 'src/core/features/vim-mode/roam/roam-panel'

export const navigationCommands = [
    nvmap('k', 'Select Block Up', mode => jumpBlocksInFocusedPanel(mode, -1)),
    nvmap('j', 'Select Block Down', mode => jumpBlocksInFocusedPanel(mode, 1)),
    nmap('Control+u', 'Select Many Blocks Up', mode => jumpBlocksInFocusedPanel(mode, -8)),
    nmap('Control+d', 'Select Many Blocks Down', mode => jumpBlocksInFocusedPanel(mode, 8)),
    nvmap('Control+y', 'Scroll Up', () => RoamPanel.selected().scrollAndReselectBlockToStayVisible(-50)),
    // ctrl-e is normally used to go to the end of line, avoid messing with this
    // in insert mode
    nvmap('Control+e', 'Scroll Down', () => RoamPanel.selected().scrollAndReselectBlockToStayVisible(50)),
]
