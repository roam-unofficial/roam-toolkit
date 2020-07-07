import {initializeBlockNavigationMode} from 'src/core/features/vim-mode/vim-init'
import {map, nmap, returnToNormalMode} from 'src/core/features/vim-mode/vim'
import {Feature, Settings} from 'src/core/settings'
import {NavigationCommands} from 'src/core/features/vim-mode/commands/navigation-commands'
import {HistoryCommands} from 'src/core/features/vim-mode/commands/history-commands'
import {InsertCommands} from 'src/core/features/vim-mode/commands/insert-commands'
import {ClipboardCommands} from 'src/core/features/vim-mode/commands/clipboard-commands'
import {PanelCommands} from 'src/core/features/vim-mode/commands/panel-commands'
import {VisualCommands} from 'src/core/features/vim-mode/commands/visual-commands'
import {BlockManipulationCommands} from 'src/core/features/vim-mode/commands/block-manipulation-commands'
import {RoamBlock} from 'src/core/features/vim-mode/roam/roam-block'
import {HintCommands} from 'src/core/features/vim-mode/commands/hint-commands'

export const config: Feature = {
    id: 'block_navigation_mode',
    name: 'Vim-like Block Navigation',
    warning: 'Experimental; Intrusive, may interfere with your regular workflow',
    enabledByDefault: false,
    settings: [
        map('Escape', 'Exit to Normal Mode', returnToNormalMode),
        nmap('z', 'Toggle Fold Block', () => RoamBlock.selected().toggleFold()),
        ...NavigationCommands,
        ...PanelCommands,
        ...InsertCommands,
        ...HistoryCommands,
        ...ClipboardCommands,
        ...VisualCommands,
        ...BlockManipulationCommands,
        ...HintCommands,
    ],
}

Settings.isActive('block_navigation_mode').then(active => {
    if (active) {
        initializeBlockNavigationMode()
    }
})
