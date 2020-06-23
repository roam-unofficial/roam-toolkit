import {relativeItem} from 'src/core/common/array'

describe(relativeItem, () => {
    it('can return the item after the specified index', () => {
        expect(relativeItem(['a', 'b', 'c'], 1, 1)).toBe('c')
    })

    it('can return the item previous to the specified index', () => {
        expect(relativeItem(['a', 'b', 'c'], 1, -1)).toBe('a')
    })

    it('returns the last item if it would otherwise go out of bounds', () => {
        expect(relativeItem(['a', 'b', 'c'], 1, 10)).toBe('c')
    })

    it('returns the first item if it would otherwise go out of bounds', () => {
        expect(relativeItem(['a', 'b', 'c'], 1, -10)).toBe('a')
    })
});