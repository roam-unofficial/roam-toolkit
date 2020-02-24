import {RoamNode} from '../utils/roam';
import {RoamDate} from './common';
import {Constructor} from '../mixins/common';

export function withDate<T extends Constructor<RoamNode>>(SuperClass: T) {
    return class NodeWithDate extends SuperClass {
        listDatePages() {
            return this.text.match(RoamDate.regex) || []
        }

        /** If has 1 date - replace it, if more then 1 date - append it */
        withDate(date: Date) {
            const currentDates = this.listDatePages()
            const newDate = RoamDate.format(date);
            const newText = currentDates.length === 1 ?
                this.text.replace(currentDates[0], newDate) :
                this.text + ' ' + newDate;

            return new NodeWithDate(newText, this.selection)
        }
    };
}