import {Feature, Shortcut} from '../../utils/settings'
import {RoamNode, Selection} from '../../roam/roam-node'
import {Roam} from '../../roam/roam'
console.log('block manipulation!')

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
            onPress: () => navigator.clipboard.writeText(getCurrentBlockReference()),
        } as Shortcut,
        {
            type: 'shortcut',
            id: 'copyBlockEmbed',
            label: 'Copy Block Embed',
            initValue: 'ctrl+meta+c',
            onPress: () => navigator.clipboard.writeText(getCurrentBlockEmbed()),
        } as Shortcut,
    ],
}

const getCurrentBlockEmbed = () => `{{embed: ${getCurrentBlockReference()}}}`

function getCurrentBlockReference() {
    // TODO: better interfaces, uid should be a part of the block interfaces
    return `((${Roam.getCurrentBlockUid()}))`
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
