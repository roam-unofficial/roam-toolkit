import {getHint, HINT_IDS, HINT_KEYS} from 'SRC/core/features/vim-mode/hint-view'
import {nmap} from 'SRC/core/features/vim-mode/vim'
import {Mouse} from 'SRC/core/common/mouse'
import {KEY_TO_SHIFTED} from 'SRC/core/common/keycodes'

export const hintCommands = HINT_IDS.flatMap(n => [
    nmap(HINT_KEYS[n], `Click Hint ${n}`, () => {
        const hint = getHint(n)
        if (hint) {
            Mouse.leftClick(hint)
        }
    }),
    nmap(`${KEY_TO_SHIFTED[HINT_KEYS[n]]}`, `Shift Click Hint ${n}`, () => {
        const hint = getHint(n)
        if (hint) {
            Mouse.leftClick(hint, true)
        }
    }),
])
