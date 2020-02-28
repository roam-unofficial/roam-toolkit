import {SM2Node} from './SM2Node';
import {addDays} from '../date/common';

interface Scheduler {
    schedule(node: SM2Node, signal: SRSSignal): SM2Node
}

/**
 * Again (1)
 * The card is placed into relearning mode, the ease is decreased by 20 percentage points
 * (that is, 20 is subtracted from the ease value, which is in units of percentage points), and the current interval is
 * multiplied by the value of new interval (this interval will be used when the card exits relearning mode).
 *
 * Hard (2)
 * The card’s ease is decreased by 15 percentage points and the current interval is multiplied by 1.2.
 *
 * Good (3)
 * The current interval is multiplied by the current ease. The ease is unchanged.
 *
 * Easy (4)
 * The current interval is multiplied by the current ease times the easy bonus and the ease is
 * increased by 15 percentage points.
 * For Hard, Good, and Easy, the next interval is additionally multiplied by the interval modifier.
 * If the card is being reviewed late, additional days will be added to the current interval, as described here.
 *
 * There are a few limitations on the scheduling values that cards can take.
 * Eases will never be decreased below 130%; SuperMemo’s research has shown that eases below 130% tend to result in
 * cards becoming due more often than is useful and annoying users.
 */
export class AnkiScheduler implements Scheduler {
    static defaultEase = 2
    static defaultInterval = 2

    static maxInterval = 50 * 365
    static minEase = 1.3

    schedule(node: SM2Node, signal: SRSSignal): SM2Node {
        // todo min ease, max interval, etc

        const newParams = this.getNewParameters(node, signal);

        const currentDate = node.listDates()[0] || new Date()
        return node
            .withInterval(newParams.interval)
            .withEase(newParams.ease)
            // TODO random jitter, in percentage points of interval
            .withDate(addDays(currentDate, Math.ceil(newParams.interval)))
    }

    getNewParameters(node: SM2Node, signal: SRSSignal) {
        const ease = node.ease || AnkiScheduler.defaultEase
        const interval = node.interval || AnkiScheduler.defaultInterval

        let newEase = ease
        let newInterval = interval

        const easeModifier = 0.15
        switch (signal) {
            case SRSSignal.AGAIN:
                newEase = ease - 0.2
                newInterval = 1
                break;
            case SRSSignal.HARD:
                newEase = ease - easeModifier
                newInterval = interval * 1.2
                break
            case SRSSignal.GOOD:
                newInterval = interval * ease
                break
            case SRSSignal.EASY:
                newInterval = interval * ease
                newEase = ease + easeModifier
                break
        }

        return AnkiScheduler.enforceLimits(new SM2Params(newInterval, newEase))
    }

    private static enforceLimits(params: SM2Params) {
        return new SM2Params(
            Math.min(params.interval, AnkiScheduler.maxInterval),
            Math.max(params.ease, AnkiScheduler.minEase))
    }
}

class SM2Params {
    constructor(readonly interval: number, readonly ease: number) {
    }
}

export enum SRSSignal {
    AGAIN = 1,
    HARD,
    GOOD,
    EASY,
}

export const SRSSignals = [SRSSignal.AGAIN, SRSSignal.HARD, SRSSignal.GOOD, SRSSignal.EASY]