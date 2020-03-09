import * as chrono from 'chrono-node';
import {Roam, RoamNode, Selection} from '../../utils/roam';
import {afterClosingBrackets} from '../../utils/brackets';
import {RoamDate} from '../../date/common';

export const guard = ';';
const dateContainerExpr = /;(.{3,}?);/gm;

export function replaceFuzzyDate() {
    Roam.applyToCurrent(node => {
        const newText = node.text.replace(dateContainerExpr, (substring => {
            const date = chrono.parseDate(substring, new Date(), {forwardDate: true});
            if (!date) return substring;

            return RoamDate.format(date)
        }));

        const cursor = node.text === newText ?
            node.selection.start : afterClosingBrackets(newText, node.selection.start);
        return new RoamNode(newText, new Selection(cursor, cursor));
    });
}
