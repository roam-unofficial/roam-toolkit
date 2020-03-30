import {Feature, Shortcut} from '../../utils/settings'
import {RoamNode, Selection} from '../../roam/roam-node';
import {Roam} from '../../roam/roam';
import {Browser} from '../../utils/browser';
import {RoamDate} from '../../date/common';

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
            id: 'copyBlockEmbed',
            label: 'Copy Block Embed',
            initValue: 'ctrl+meta+c',
            onPress: () => navigator.clipboard.writeText(getCurrentBlockEmbed())
        } as Shortcut,
        {
            type: 'shortcut',
            id: 'goToTodayPage',
            label: 'Go to today page',
            initValue: 'ctrl+shift+`',
            onPress: () => goToTodayPage()
        } as Shortcut,
    ]
}

const goToTodayPage = async () => {
    const currentDate = new Date();
    // Tomorrow starts at 2am for the purposes of this
    currentDate.setHours(currentDate.getHours() - 2)
    return Browser.goToPage(Roam.baseUrl().toString() + '/' + RoamDate.formatUS(currentDate))
}

const getCurrentBlockEmbed = () => `{{embed: ${getCurrentBlockReference()}}}`

function getCurrentBlockReference() {
    const dbId = Roam.getCurrentBlockId()
    // TODO: better interfaces, uid should be a part of the block interfaces
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