import { getActiveEditElement } from '../../utils/dom';
import { Feature } from '../../utils/settings'

export const config: Feature = {
    id: 'duplicate',
    name: 'Duplicate',
    settings: [
        {
            type: 'shortcut', id: 'dupShortcut', label: 'Shortcut for duplication', initValue: '',
            onPress: () => duplicate()
        },
    ]
}


















const pasteEvent = new Event('input', {
    bubbles: true,
    cancelable: true,
});
const inputEvent = new Event('input', {
    bubbles: true,
    cancelable: true,
});

const duplicate = () => {
    const element = getActiveEditElement() as HTMLTextAreaElement;

    if (element.nodeName === 'TEXTAREA') {
        const blockContent = element.value;

        if (element.selectionStart !== element.selectionEnd) { // duplicate selection
            const contentToPaste = element.value.substring(element.selectionStart, element.selectionEnd);
            const selectionLength = contentToPaste.length;
            const selectionEnd = element.selectionEnd
            element.value = element.value.substring(0, element.selectionEnd)
                + contentToPaste
                + element.value.substring(element.selectionEnd);
            element.selectionStart = selectionEnd;
            element.selectionEnd = selectionEnd + selectionLength;
            element.dispatchEvent(inputEvent);
        } else { // duplicate block
            element.value = '';
            element.dispatchEvent(inputEvent);
            navigator.clipboard.readText().then(oldClipboardContent => {
                navigator.clipboard.writeText(blockContent + '\r\n' + blockContent).then(() => {
                    document.execCommand('paste');
                    element.dispatchEvent(pasteEvent);
                    navigator.clipboard.writeText(oldClipboardContent);
                });
            });
        }
    }
}

// browser.runtime.onMessage.addListener((command) => {
//     if (command === 'duplicate-content') {
//         duplicate();
//     }
// });