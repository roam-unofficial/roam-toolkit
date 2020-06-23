import {initializeBlockNavigationMode} from 'src/core/features/vim-mode/vim-init'
import {map, nmap, returnToNormalMode} from 'src/core/features/vim-mode/vim'
import {Feature, Settings} from 'src/core/settings'
import {navigationCommands} from 'src/core/features/vim-mode/commands/navigation-commands'
import {historyCommands} from 'src/core/features/vim-mode/commands/history-commands'
import {insertCommands} from 'src/core/features/vim-mode/commands/insert-commands'
import {clipboardCommands} from 'src/core/features/vim-mode/commands/clipboard-commands'
import {panelCommands} from 'src/core/features/vim-mode/commands/panel-commands'
import {visualCommands} from 'src/core/features/vim-mode/commands/visual-commands'
import {blockManipulationCommands} from 'src/core/features/vim-mode/commands/block-manipulation-commands'
import {RoamBlock} from 'src/core/features/vim-mode/roam/roam-block'
import {hintCommands} from 'src/core/features/vim-mode/commands/hint-commands'

export const config: Feature = {
    id: 'block_navigation_mode',
    name: 'Vim-like Block Navigation (Requires Refresh)',
    enabledByDefault: false,
    settings: [
        map('Escape', 'Exit to Normal Mode', returnToNormalMode),
        nmap('z', 'Toggle Fold Block', () => RoamBlock.selected().toggleFold()),
        ...navigationCommands,
        ...panelCommands,
        ...insertCommands,
        ...historyCommands,
        ...clipboardCommands,
        ...visualCommands,
        ...blockManipulationCommands,
        ...hintCommands,
    ],
}

Settings.isActive('block_navigation_mode').then(active => {
    if (active) {
        initializeBlockNavigationMode()
    }
})
