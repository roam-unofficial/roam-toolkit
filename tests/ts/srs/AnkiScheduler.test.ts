import {AnkiScheduler, SRSSignal} from '../../../src/ts/srs/scheduler';
import {SM2Node} from '../../../src/ts/srs/SM2Node';

describe(AnkiScheduler, () => {
    const subject = new AnkiScheduler()
    const unscheduledNode = new SM2Node('empty')

    test('on good, current interval multiplied by current factor', () => {
        const testNode = new SM2Node('blah ').withInterval(5).withFactor(2)

        expect(subject.schedule(testNode, SRSSignal.GOOD).interval).toBe(10)
    })

    test('no scheduling info - schedule with default values', () => {
        const rescheduledNode = subject.schedule(unscheduledNode, SRSSignal.GOOD)

        expect(rescheduledNode.interval).toBe(AnkiScheduler.defaultInterval * AnkiScheduler.defaultFactor)
        expect(rescheduledNode.factor).toBe(AnkiScheduler.defaultFactor)
        expect(rescheduledNode.listDatePages).not.toBeEmpty()
    })

    // TODO
    test('again', () => {})
    test('hard', () => {})
    test('easy', () => {})
    test('limits', () => {})
})