import {getHint, HINT_IDS, DEFAULT_HINT_KEYS} from 'src/core/features/vim-mode/hint-view'
import {nmap} from 'src/core/features/vim-mode/vim'
import {Mouse} from 'src/core/common/mouse'

export const HintCommands = HINT_IDS.flatMap(n => [
    nmap(DEFAULT_HINT_KEYS[n], `Click Hint ${n}`, () => {
        const hint = getHint(n)
        if (hint) {
            Mouse.leftClick(hint)
        }
    }),
    nmap(`shift+${DEFAULT_HINT_KEYS[n]}`, `Shift Click Hint ${n}`, () => {
        const hint = getHint(n)
        if (hint) {
            Mouse.leftClick(hint, true)
        }
    }),
])
