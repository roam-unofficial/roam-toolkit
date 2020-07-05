import {zipObjects} from 'src/core/common/object'

describe(zipObjects, () => {
    it('bundles values matching the same key into a tuple', async () => {
        expect(zipObjects({a: 1, b: 2}, {a: '1', b: '2'})).toEqual({
            a: [1, '1'],
            b: [2, '2'],
        })
    })

    it('only includes keys from the first object', async () => {
        expect(zipObjects({a: 1}, {a: '1', b: '2'})).toEqual({
            a: [1, '1'],
        })
    })

    it('excludes keys for which there is no matching key', async () => {
        expect(zipObjects({a: 1}, {b: 2})).toEqual({})
    })
})
