import {delay} from 'src/core/common/async'
import {
    jumpBlocksInFocusedPanel,
    Mode,
    nmap,
    nvmap,
    returnToNormalMode
} from 'src/core/features/vim-mode/vim'
import {insertBlockAfter} from 'src/core/features/vim-mode/commands/insert-commands'
import {Roam} from 'src/core/roam/roam'
import {copyBlockEmbed, copyBlockReference} from 'src/core/roam/block'
import {RoamPanel} from 'src/core/features/vim-mode/roam/roam-panel'
import {RoamBlock} from 'src/core/features/vim-mode/roam/roam-block'

const cutAndGoBackToNormal = async () => {
    document.execCommand('cut')
    // Wait for the block to disappear, double check that a block is still selected
    // Deleting the first line can lead to no previous block existing to select
    await delay(0)
    await returnToNormalMode()
}

export const clipboardCommands = [
    nmap('p', 'Paste', async () => {
        await insertBlockAfter()
        document.execCommand('paste')
        await returnToNormalMode()
    }),
    nmap('P', 'Paste Before', async () => {
        await jumpBlocksInFocusedPanel(Mode.NORMAL, -1)
        await insertBlockAfter()
        document.execCommand('paste')
        await returnToNormalMode()
    }),
    nvmap('y', 'Copy', async mode => {
        if (mode === Mode.NORMAL) {
            await Roam.selectBlock(RoamBlock.selected().element())
        }
        document.execCommand('copy')
        await returnToNormalMode()
    }),
    nvmap('Alt+y', 'Copy Block Reference', () => copyBlockReference(RoamPanel.selected().selectedBlockId())),
    nvmap('Y', 'Copy Block Embed', () => copyBlockEmbed(RoamPanel.selected().selectedBlockId())),
    // mapping 'd d' and 'd' conflict with each other.
    // replicate the behavior of `d d` by entering visual, and then cutting
    // this gives more feedback in the UX anyways
    nvmap('d', 'Enter Visual Mode / Cut in Visual Mode', async mode => {
        if (mode === Mode.NORMAL) {
            return Roam.selectBlock(RoamBlock.selected().element())
        }
        await cutAndGoBackToNormal()
    }),
]
