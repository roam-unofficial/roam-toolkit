import {SM2Node} from './SM2Node'

export interface Scheduler {
    schedule(node: SM2Node, signal: SRSSignal): SM2Node
}

export enum SRSSignal {
    AGAIN = 1,
    HARD,
    GOOD,
    EASY,
}

export const SRSSignals = [SRSSignal.AGAIN, SRSSignal.HARD, SRSSignal.GOOD, SRSSignal.EASY]
