import {Feature, Shortcut} from '../utils/settings'
import {RoamNode, Selection} from '../roam/roam-node'
import {Roam} from '../roam/roam'
import {copyBlockEmbed, copyBlockReference} from '../roam/roam-block'

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
            onPress: () => copyBlockReference(Roam.getRoamBlockInput()?.id)
        } as Shortcut,
        {
            type: 'shortcut',
            id: 'copyBlockEmbed',
            label: 'Copy Block Embed',
            initValue: 'ctrl+meta+c',
            onPress: () => copyBlockEmbed(Roam.getRoamBlockInput()?.id)
        } as Shortcut,
    ],
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
