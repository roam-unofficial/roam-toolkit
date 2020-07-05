import {Dictionary} from 'lodash'

/**
 * Given two dictionaries with the same keys, returns a new object with tuples of
 * the two values for each key
 */
export const zipObjects = <X, Y>(xs: Dictionary<X>, ys: Dictionary<Y>): Dictionary<[X, Y]> =>
    Object.keys(xs).reduce((keyToXY, key) => {
        const x = xs[key]
        const y = ys[key]
        if (x && y) {
            return {
                ...keyToXY,
                [key]: [x, y],
            }
        }
        return keyToXY
    }, {})
