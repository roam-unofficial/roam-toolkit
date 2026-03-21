import {copyBlockEmbed, copyBlockReference, getBlockUid} from 'src/core/roam/block'

import {Feature, Shortcut} from '../settings'
import {RoamNode, Selection} from '../roam/roam-node'
import {Roam} from '../roam/roam'
import {RoamDb} from '../roam/roam-db'
import {Selectors} from '../roam/selectors'

export const config: Feature = {
    id: 'block_manipulation',
    name: 'Block manipulation',
    settings: [
        {
            type: 'shortcut',
            id: 'duplicateBlockOrSelection',
            label: 'Duplicate block or selection',
            initValue: 'Meta+shift+d',
            onPress: () => duplicate(),
        } as Shortcut,
        {
            type: 'shortcut',
            id: 'deleteBlock',
            label: 'Delete block',
            initValue: 'Alt+k',
            placeholder: 'e.g. cmd+shift+backspace',
            onPress: () => Roam.deleteBlock(),
        } as Shortcut,
        {
            type: 'shortcut',
            id: 'copyBlockRef',
            label: 'Copy Block Reference',
            initValue: 'ctrl+shift+c',
            onPress: () => copyBlockReference(Roam.getRoamBlockInput()?.id),
        } as Shortcut,
        {
            type: 'shortcut',
            id: 'copyBlockEmbed',
            label: 'Copy Block Embed',
            initValue: 'ctrl+meta+c',
            onPress: () => copyBlockEmbed(Roam.getRoamBlockInput()?.id),
        } as Shortcut,
        {
            type: 'shortcut',
            id: 'collapseBlockIntoParent',
            label: 'Collapse block into parent',
            initValue: 'shift+ctrl+z',
            onPress: () => collapseBlockIntoParent(),
        } as Shortcut,
    ],
}

export const collapseBlockIntoParent = (blockUid?: string) => {
    const childUid = blockUid || getBlockUid(Roam.getRoamBlockInput()?.id || '')
    if (!childUid) return

    const parentUid = RoamDb.getParentBlockUid(childUid)
    if (!parentUid) return

    RoamDb.setBlockOpen(parentUid, false)

    const parentBlock = document.querySelector(`${Selectors.block}[id$="${parentUid}"]`) as HTMLElement
    if (parentBlock) {
        Roam.activateBlock(parentBlock)
    }
}

const duplicate = () => {
    const node = Roam.getActiveRoamNode()
    const selectedText = node?.selectedText()

    if (node && selectedText) {
        const newText = node.textBeforeSelection() + selectedText + selectedText + node.textAfterSelection()
        Roam.save(new RoamNode(newText, new Selection(node.selection.end, node.selection.end + selectedText.length)))
    } else {
        Roam.duplicateBlock()
    }
}
