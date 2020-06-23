export const relativeItem = <T>(xs: T[], index: number, relativeIndex: number): T => {
    let destinationIndex
    if (Math.sign(relativeIndex) > 0) {
        destinationIndex = Math.min(index + relativeIndex, xs.length - 1)
    } else {
        destinationIndex = Math.max(0, index + relativeIndex)
    }

    return xs[destinationIndex]
}


// TODO: use https://docs-lodash.com/v4/find-last/ instead of findLast in later commits
