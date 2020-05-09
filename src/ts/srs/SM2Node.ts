import { withDate } from '../date/withDate';
import { RoamNode, Selection } from '../roam/roam-node';

export class SM2Node extends withDate(RoamNode) {
  constructor(text: string, selection: Selection = new Selection()) {
    super(text, selection);
  }

  private readonly intervalProperty = 'interval';
  private readonly factorProperty = 'factor';

  get interval(): number | undefined {
    return parseFloat(this.getInlineProperty(this.intervalProperty)!);
  }

  withInterval(interval: number): SM2Node {
    // Discarding the fractional part for display purposes/and so we don't get infinite number of intervals
    // Should potentially reconsider this later
    return this.withInlineProperty(
      this.intervalProperty,
      Number(interval).toFixed(1)
    );
  }

  get factor(): number | undefined {
    return parseFloat(this.getInlineProperty(this.factorProperty)!);
  }

  withFactor(factor: number): SM2Node {
    return this.withInlineProperty(
      this.factorProperty,
      Number(factor).toFixed(2)
    );
  }
}
