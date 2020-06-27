import {delay, repeatAsync} from 'src/core/common/async'

describe(repeatAsync, () => {
    it('can repeat an asynchronous function sequentially 3 times', async () => {
        let n = 0
        await repeatAsync(3, async () => {
            await delay(1)
            n += 1
        })

        expect(n).toBe(3)
    })

    it('bubbles up errors from any iteration', () => {
        expect(
            repeatAsync(3, async () => {
                throw new Error('unfortunate')
            })
        ).rejects.toThrow('unfortunate')
    })
})
