import {nimap, nmap, nvmap, RoamVim} from 'src/core/features/vim-mode/vim'
import {VimRoamPanel} from 'src/core/features/vim-mode/roam/roam-vim-panel'
import {closePageReferenceView, expandLastBreadcrumb, openMentions, openParentPage} from 'src/core/roam/references'

export const NavigationCommands = [
    nvmap('k', 'Select Block Up', () => RoamVim.jumpBlocksInFocusedPanel(-1)),
    nvmap('j', 'Select Block Down', () => RoamVim.jumpBlocksInFocusedPanel(1)),
    nmap('shift+h', 'Select First Visible Block', () => VimRoamPanel.selected().selectFirstVisibleBlock()),
    nmap('shift+l', 'Select Last Visible Block', () => VimRoamPanel.selected().selectLastVisibleBlock()),
    nmap('g g', 'Select First Block', () => VimRoamPanel.selected().selectFirstBlock()),
    nmap('shift+g', 'Select Last Block', () => VimRoamPanel.selected().selectLastBlock()),
    nmap('ctrl+u', 'Select Many Blocks Up', () => RoamVim.jumpBlocksInFocusedPanel(-8)),
    nmap('ctrl+d', 'Select Many Blocks Down', () => RoamVim.jumpBlocksInFocusedPanel(8)),
    nvmap('ctrl+y', 'Scroll Up', () => VimRoamPanel.selected().scrollAndReselectBlockToStayVisible(-50)),
    // Avoid insert mode, to allow native ctrl-e to go to end of line
    nvmap('ctrl+e', 'Scroll Down', () => VimRoamPanel.selected().scrollAndReselectBlockToStayVisible(50)),
    nimap('alt+z', 'Expand Last Reference Breadcrumb', expandLastBreadcrumb),
    nmap('shift+z', 'Collapse the view for the page in references (or query) section', closePageReferenceView),
    nmap('1', 'Open parent page', () => openParentPage()),
    nmap('shift+1', 'Open parent page in sidebar', () => openParentPage(true)),
    nmap('2', 'Open mentions', () => openMentions()),
    nmap('shift+2', 'Open mentions in sidebar', () => openMentions(true)),
]
