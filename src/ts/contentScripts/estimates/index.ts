import {Roam, RoamNode} from '../../utils/roam';
import {Feature, getSetting, Textarea} from '../../utils/settings';
import {getActiveEditElement} from '../../utils/dom';


// TODO: Input instead of textarea
const estimateProperty: Textarea = {type: 'textarea', id: 'estimate_property', label: 'Property to base estimates on'};

export const config: Feature = {
    id: 'calculate-estimate',
    name: 'Calculate estimate',
    shortcuts: [
        {
            id: 'calculate-estimate', label: 'Calculate estimate shortcut', initValue: 'ctl+m', placeholder: '',
            onPress: calculateFirstSiblingTotal
        }
    ],
    settings: [
        estimateProperty,
    ]
};

function getParentElement() {
    return getActiveEditElement()?.closest('.roam-block-container')?.parentElement;
}

/** I'm still figuring out UX on this one.
 * The current expectation is that you have to create a parent node, put a query as a child of it,
 * then run this with cursor ina query sibling.
 * Maybe I should create sibling? then you can do it from query node, which seems somewhat more intuitive
 * but when your cursor is in the query node it's not rendered, which may be confusing
 *
 * or maybe flow - you select query node, then press shortcut, get estimate for it in new node below
 *
 */
export async function calculateFirstSiblingTotal() {
    const attributeName = await getSetting(config.id, estimateProperty.id) || 'pomodoro_estimate';
    const estimateRegex = new RegExp(`${attributeName}:\\s*(\\d+\\.?\\d*)`, 'g');

    const queryNode = getParentElement()?.querySelector('.rm-reference-main') as HTMLElement;
    const queryText = queryNode?.innerText;
    console.log('Extracting estimate from ' + queryText);

    let total = 0;

    const nextMatch = () => estimateRegex.exec(queryText);
    let match = nextMatch();
    while (match) {
        total += parseFloat(match[1]);
        match = nextMatch();
    }

    Roam.applyToCurrent(node => new RoamNode(`total_${attributeName}::${total}` + node.text, node.selection))
}