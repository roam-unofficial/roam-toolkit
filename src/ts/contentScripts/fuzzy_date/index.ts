import * as chrono from 'chrono-node';
import {Roam, RoamNode} from '../../utils/roam';
import dateFormat from 'dateformat';

export const guard = ';';
const dateContainerExpr = /;(.{3,}?);/gm;
const roamFormat = "'[['mmmm dS, yyyy']]'";

export function replaceFuzzyDate() {
    Roam.applyToCurrent(node => {
        const newText = node.text.replace(dateContainerExpr, (substring => {
            const date = chrono.parseDate(substring, new Date(), {forwardDate: true});
            if (!date) return substring;

            return dateFormat(date, roamFormat);
        }));

        return new RoamNode(newText, node.selection);
    });
}