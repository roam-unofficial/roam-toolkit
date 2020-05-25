import {SRSSignal} from '../../../src/ts/srs/scheduler';
import {SM2Node} from '../../../src/ts/srs/SM2Node';
import {AnkiScheduler} from '../../../src/ts/srs/AnkiScheduler';

describe(AnkiScheduler, () => {
    const subject = new AnkiScheduler()
    const unscheduledNode = new SM2Node('empty')

    test('on good, current interval multiplied by current factor + jitter', () => {
        const testNode = new SM2Node('blah ').withInterval(5).withFactor(2)


        const rescheduledNode = subject.schedule(testNode, SRSSignal.GOOD)
        expect(rescheduledNode.factor).toBe(testNode.factor)

        const jitter = rescheduledNode.interval! * AnkiScheduler.jitterPercentage
        const newBaseInterval = testNode.factor! * testNode.interval!

        // Adding floor/ceil because of additional transformations performed by `withInterval`
        expect(rescheduledNode.interval).toBeWithin(
            Math.floor(newBaseInterval - jitter), Math.ceil(newBaseInterval + jitter))
    })

    test('no scheduling info - schedule with default values', () => {
        const rescheduledNode = subject.schedule(unscheduledNode, SRSSignal.GOOD)

        expect(rescheduledNode.interval).toBeDefined()
        expect(rescheduledNode.factor).toBe(AnkiScheduler.defaultFactor)
        expect(rescheduledNode.listDatePages).not.toBeEmpty()
    })

    // TODO
    test('again', () => {
    })
    test('hard', () => {
    })
    test('easy', () => {
    })
    test('limits', () => {
    })
})