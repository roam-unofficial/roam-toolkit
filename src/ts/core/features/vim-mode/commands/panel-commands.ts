import {map, nmap} from 'src/core/features/vim-mode/vim'
import {Selectors} from 'src/core/roam/selectors'
import {Mouse} from 'src/core/common/mouse'
import {RoamPanel} from 'src/core/features/vim-mode/roam/roam-panel'
import {RoamBlock} from 'src/core/features/vim-mode/roam/roam-block'

export const panelCommands = [
    nmap('h', 'Select Panel Left', () => RoamPanel.select('MAIN')),
    nmap('l', 'Select Panel Right', () => {
        if (document.querySelector(Selectors.sidebarContent)) {
            RoamPanel.select('SIDE')
        }
    }),
    map('Control+w', 'Close Page in Side Bar', () => {
        const block = RoamBlock.selected().element()
        const pageContainer = block.closest(`${Selectors.sidebarContent} > div`)
        const closeButton = pageContainer?.querySelector(Selectors.closeButton)
        if (closeButton) {
            Mouse.leftClick(closeButton as HTMLElement)
        }
    }),
]
