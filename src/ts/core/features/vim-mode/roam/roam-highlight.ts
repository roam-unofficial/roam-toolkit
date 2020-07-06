import {Selectors} from 'src/core/roam/selectors'
import {BlockElement} from 'src/core/features/vim-mode/roam/roam-block'
import {assumeExists} from 'src/core/common/assert'

const highlightedBlocks = (): NodeListOf<BlockElement> =>
    document.querySelectorAll(`${Selectors.highlight} ${Selectors.block}`)

/**
 * A "Highlight" is the native roam selection you get when
 * selecting of blocks.
 *
 * Native highlights are reused in order to simulate Vim's "visual mode".
 *
 * The generically reusable parts of this should probably move to core/roam
 */
export const RoamHighlight = {
    highlightedBlocks,

    first: (): BlockElement => assumeExists(highlightedBlocks()[0], 'No block is highlighted'),

    last: (): BlockElement => {
        const blocks = highlightedBlocks()
        return assumeExists(blocks[blocks.length - 1], 'No block is highlighted')
    },
}
