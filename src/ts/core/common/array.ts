export const relativeItem = <T>(xs: T[], index: number, relativeIndex: number): T => {
    let destinationIndex
    if (Math.sign(relativeIndex) > 0) {
        destinationIndex = Math.min(index + relativeIndex, xs.length - 1)
    } else {
        destinationIndex = Math.max(0, index + relativeIndex)
    }

    return xs[destinationIndex]
}


export const findLast = <T>(xs: T[], criteria: (x: T) => boolean): T | undefined => {
    for (let i = xs.length - 1; i >= 0; i--) {
        if (criteria(xs[i])) {
            return xs[i];
        }
    }
    return undefined
}