import {RoamDate} from './index'
import {Constructor} from '../../common/mixins/common'
import {RoamNode} from '../roam-node'

export function withDate<T extends Constructor<RoamNode>>(SuperClass: T) {
    return class NodeWithDate extends SuperClass {
        listDatePages() {
            return this.text.match(RoamDate.regex) || []
        }

        listDates() {
            return this.listDatePages().map(ref => RoamDate.parseFromReference(ref))
        }

        /** If has 1 date - replace it, if more then 1 date - append it */
        withDate(date: Date) {
            const currentDates = this.listDatePages()
            const newDate = RoamDate.formatPage(date)
            const newText =
                currentDates.length === 1 ? this.text.replace(currentDates[0], newDate) : this.text + ' ' + newDate

            // @ts-ignore
            return new this.constructor(newText, this.selection)
        }
    }
}

export const NodeWithDate = withDate(RoamNode)
