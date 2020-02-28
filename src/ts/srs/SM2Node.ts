import {RoamNode, Selection} from '../utils/roam';
import {withDate} from '../date/withDate';


export class SM2Node extends withDate(RoamNode) {
    constructor(text: string, selection: Selection = new Selection()) {
        super(text, selection);
    }

    private readonly intervalProperty = 'interval';
    private readonly easeProperty = 'ease';

    get interval(): number | undefined {
        return parseFloat(this.getInlineProperty(this.intervalProperty)!);
    }

    withInterval(interval: number) {
        // Discarding the fractional part for display purposes/and so we don't get infinite number of intervals
        // Should potentially reconsider this later
        return this.withInlineProperty(this.intervalProperty, Number(interval).toFixed(1));
    }

    get ease(): number | undefined {
        return parseFloat(this.getInlineProperty(this.easeProperty)!);
    }

    withEase(ease: number) {
        return this.withInlineProperty(this.easeProperty, Number(ease).toFixed(2));
    }
}