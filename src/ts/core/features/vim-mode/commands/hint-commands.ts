import {getHint, HINT_IDS, DEFAULT_HINT_KEYS} from 'src/core/features/vim-mode/hint-view'
import {nmap} from 'src/core/features/vim-mode/vim'
import {Mouse} from 'src/core/common/mouse'
import {isMacOS} from 'src/core/common/platform'

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
            Mouse.leftClick(hint, {shiftKey: true})
        }
    }),
    nmap(`ctrl+shift+${DEFAULT_HINT_KEYS[n]}`, `Ctrl Shift Click Hint ${n}`, () => {
        const hint = getHint(n)
        if (hint) {
            // Don't ctrl click on mac, otherwise it'll open up the right click menu
            Mouse.leftClick(hint, {shiftKey: true, metaKey: isMacOS(), ctrlKey: !isMacOS()})
        }
    }),
])
