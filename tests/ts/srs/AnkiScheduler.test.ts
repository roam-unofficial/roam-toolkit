import {AnkiScheduler, SRSSignal} from '../../../src/ts/srs/scheduler';
import {SM2Node} from '../../../src/ts/srs/SM2Node';

describe(AnkiScheduler, () => {
    const subject = new AnkiScheduler()
    const unscheduledNode = new SM2Node("empty")

    test('on good, current interval multiplied by current ease', () => {
        const testNode = new SM2Node("blah [[[[interval]]::5]] [[[[ease]]::2]]")

        expect(subject.schedule(testNode, SRSSignal.GOOD).interval).toBe(10)
    })

    test('no scheduling info - schedule with default values', () => {
        const rescheduledNode = subject.schedule(unscheduledNode, SRSSignal.GOOD)

        expect(rescheduledNode.interval).toBe(AnkiScheduler.defaultInterval* AnkiScheduler.defaultEase)
        expect(rescheduledNode.ease).toBe(AnkiScheduler.defaultEase)
    })

    // TODO
    test('again', () => {})
    test('hard', () => {})
    test('easy', () => {})
    test('limits', () => {})
    test('', () => {})

})