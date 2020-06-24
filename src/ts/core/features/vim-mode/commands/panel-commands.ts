import {map, nmap} from 'src/core/features/vim-mode/vim'
import {Selectors} from 'src/core/roam/selectors'
import {Mouse} from 'src/core/common/mouse'
import {RoamPanel} from 'src/core/features/vim-mode/roam/roam-panel'
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
    nmap('h', 'Select Main Panel', () => RoamPanel.mainPanel().select()),
    nmap('l', 'Select Prior Sidebar Panel', () => RoamPanel.previousSidebarPanel().select()),
    nmap('ctrl+k', 'Select Previous Panel', () => RoamPanel.previousPanel().select()),
    nmap('ctrl+j', 'Select Next Panel', () => RoamPanel.nextPanel().select()),
    map('ctrl+w', 'Close Page in Side Bar', closeSidebarPage),
]
