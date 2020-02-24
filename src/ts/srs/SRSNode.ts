import {RoamNode, Selection} from '../utils/roam';
import {withDate} from '../date/withDate';


export class SRSNode extends withDate(RoamNode) {
    constructor(text: string, selection: Selection = new Selection()) {
        super(text, selection);
    }

    private readonly intervalProperty = 'interval';
    private readonly easeProperty = 'ease';

    get interval(): number | undefined {
        return parseInt(this.getInlineProperty(this.intervalProperty)!);
    }

    withInterval(interval: number) {
        return this.withInlineProperty(this.intervalProperty, String(interval));
    }

    get ease(): number | undefined {
        return parseInt(this.getInlineProperty(this.easeProperty)!);
    }

    withEase(ease: number) {
        return this.withInlineProperty(this.easeProperty, String(ease));
    }
}
