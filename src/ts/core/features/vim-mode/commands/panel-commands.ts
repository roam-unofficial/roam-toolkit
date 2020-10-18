import {map, nmap} from 'src/core/features/vim-mode/vim'
import {Selectors} from 'src/core/roam/selectors'
import {Mouse} from 'src/core/common/mouse'
import {VimRoamPanel} from 'src/core/features/vim-mode/roam/roam-vim-panel'
import {RoamBlock} from 'src/core/features/vim-mode/roam/roam-block'

const closeSidebarPage = () => {
    const block = RoamBlock.selected().element
    const pageContainer = block.closest(`${Selectors.sidebarContent} > div`)
    const closeButton = pageContainer?.querySelector(Selectors.closeButton)
    if (closeButton) {
        Mouse.leftClick(closeButton as HTMLElement)
    }
}

export const PanelCommands = [
    // Need to wrap in function to preserve the `this` reference inside of RoamPanel
    nmap('h', 'Select Panel Left', () => VimRoamPanel.previousPanel().select()),
    nmap('l', 'Select Panel Right', () => VimRoamPanel.nextPanel().select()),
    map('ctrl+w', 'Close Page in Side Bar', closeSidebarPage),
]
