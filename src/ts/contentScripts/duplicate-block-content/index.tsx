import { Feature } from '../../utils/settings'
import { Roam, RoamNode, Selection } from '../../utils/roam';

export const config: Feature = {
    id: 'duplicate',
    name: 'Duplicate',
    shortcuts: [
        {
            id: 'dupShortcut', label: 'Shortcut for duplication', initValue: '',
            onPress: () => duplicate()
        },
    ]
}

const duplicate = () => {
    const node = Roam.getActiveRoamNode();
    const selectedText = node?.selectedText();

    if (node && selectedText) {
        const selectionLength = selectedText.length;
        const selectionEnd = node.selection.end
        const newText = node.text.substring(0, selectionEnd)
            + selectedText
            + node.text.substring(selectionEnd);
        Roam.save(new RoamNode(newText, new Selection(selectionEnd, selectionEnd + selectionLength)));
    } else {
        Roam.duplicateBlock()
    }
}