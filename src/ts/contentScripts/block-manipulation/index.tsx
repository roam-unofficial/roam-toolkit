import {Feature, Shortcut} from '../../utils/settings'
import {RoamNode, Selection} from '../../roam/roam-node';
import {Roam} from '../../roam/roam';

export const config: Feature = {
    id: 'block_manipulation',
    name: 'Block manipulation',
    settings: [
        {
            type: 'shortcut',
            id: 'duplicateBlockOrSelection',
            label: 'Duplicate block or selection',
            initValue: 'Meta+shift+d',
            onPress: () => duplicate()
        } as Shortcut,
        {
            type: 'shortcut',
            id: 'deleteBlock',
            label: 'Delete block',
            initValue: 'Alt+k',
            placeholder: 'e.g. cmd+shift+backspace',
            onPress: () => Roam.deleteBlock()
        } as Shortcut,
        {
            type: 'shortcut',
            id: 'copyBlockRef',
            label: 'Copy Block Reference',
            initValue: 'ctrl+shift+c',
            onPress: () => navigator.clipboard.writeText(getCurrentBlockReference())
        } as Shortcut,
        {
            type: 'shortcut',
            id: 'go_first_child',
            label: 'Go to first child',
            initValue: 'ctrl+shift+alt+meta+0',
            onPress: () => goToFirstChild()
        } as Shortcut,
    ]
}

const goToFirstChild = () => {
    const dbId = Roam.getCurrentBlockId()
    const node = Roam.get(parseInt(dbId))
    const childId = node[':block/children'][0][':db/id']
    console.log("child id", childId)
    Roam.activateBlock(childId)
};

function getCurrentBlockReference() {
    const dbId = Roam.getCurrentBlockId()
    return `((${Roam.get(parseInt(dbId))[':block/uid']}))`;
}

const duplicate = () => {
    const node = Roam.getActiveRoamNode();
    const selectedText = node?.selectedText();

    if (node && selectedText) {
        const newText = node.textBeforeSelection() + selectedText + selectedText + node.textAfterSelection()
        Roam.save(new RoamNode(newText, new Selection(node.selection.end, node.selection.end + selectedText.length)));
    } else {
        Roam.duplicateBlock()
    }
}