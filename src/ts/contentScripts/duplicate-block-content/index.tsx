import {Feature, Shortcut} from '../../utils/settings'
import {Roam, RoamNode, Selection} from '../../utils/roam';

export const config: Feature = {
    id: 'duplicate',
    name: 'Duplicate',
    settings: [
        {
            type: 'shortcut', id: 'dupShortcut', label: 'Shortcut for duplication', initValue: '',
            onPress: () => duplicate()
        } as Shortcut,
    ]
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