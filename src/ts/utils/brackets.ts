export function afterClosingBrackets(str: string, startingPosition?: number) {
    return str.indexOf(']]', startingPosition) + 2
}