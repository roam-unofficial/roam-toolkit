export class RoamNode {
    constructor(readonly text: string, readonly selection: Selection = new Selection()) {}

    textBeforeSelection() {
        return this.text.substring(0, this.selection.start)
    }

    textAfterSelection() {
        return this.text.substring(this.selection.end)
    }

    selectedText(): string {
        return this.text.substring(this.selection.start, this.selection.end)
    }

    withCursorAtTheStart = () => this.withSelection(new Selection(0, 0))
    withCursorAtTheEnd = () => this.withSelection(new Selection(this.text.length, this.text.length))

    withCursorAtSearchTerm = (searchTerm: string) => {
        const indexOfSearchTerm = this.text.indexOf(searchTerm)
        return this.withSelection(new Selection(indexOfSearchTerm, indexOfSearchTerm))
    }
    withSelection = (selection: Selection) => new RoamNode(this.text, selection)

    getInlineProperty(name: string) {
        return RoamNode.getInlinePropertyMatcher(name).exec(this.text)?.[1]
    }

    withInlineProperty(name: string, value: string, newline: boolean = false) {
        const currentValue = this.getInlineProperty(name)
        const property = RoamNode.createInlineProperty(name, value)
        const newText = currentValue
            ? this.text.replace(RoamNode.getInlinePropertyMatcher(name), property)
            : this.text + (newline ? '\n' : ' ') + property
        // @ts-ignore
        return new this.constructor(newText, this.selection)
    }

    static createInlineProperty(name: string, value: string) {
        return `[[[[${name}]]:${value}]]`
    }

    static getInlinePropertyMatcher(name: string) {
        /**
         * This has a bunch of things for backward compatibility:
         * - Potentially allowing double colon `::` between name and value
         * - Accepting both `{}` and `[[]]` wrapped properties
         */
        return new RegExp(`(?:\\[\\[|{)\\[\\[${name}]]::?(.*?)(?:]]|})`, 'g')
    }
}

export class Selection {
    constructor(readonly start: number = 0, readonly end: number = 0) {}
}
