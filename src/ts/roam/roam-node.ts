export class RoamNode {
  constructor(
    readonly text: string,
    readonly selection: Selection = new Selection()
  ) {}

  textBeforeSelection() {
    return this.text.substring(0, this.selection.start);
  }

  textAfterSelection() {
    return this.text.substring(this.selection.end);
  }

  selectedText(): string {
    return this.text.substring(this.selection.start, this.selection.end);
  }

  withCursorAtTheStart = () => this.withSelection(new Selection(0, 0));
  withCursorAtTheEnd = () =>
    this.withSelection(new Selection(this.text.length, this.text.length));

  withSelection = (selection: Selection) => new RoamNode(this.text, selection);

  getInlineProperty(name: string) {
    return RoamNode.getInlinePropertyMatcher(name).exec(this.text)?.[1];
  }

  withInlineProperty(name: string, value: string) {
    const currentValue = this.getInlineProperty(name);
    const property = RoamNode.createInlineProperty(name, value);
    const newText = currentValue
      ? this.text.replace(RoamNode.getInlinePropertyMatcher(name), property)
      : this.text + ' ' + property;
    // @ts-ignore
    return new this.constructor(newText, this.selection);
  }

  static createInlineProperty(name: string, value: string) {
    return `[[[[${name}]]:${value}]]`;
  }

  static getInlinePropertyMatcher(name: string) {
    return new RegExp(`\\[\\[\\[\\[${name}]]::?(.*?)]]`, 'g');
  }
}

export class Selection {
  constructor(readonly start: number = 0, readonly end: number = 0) {}
}
