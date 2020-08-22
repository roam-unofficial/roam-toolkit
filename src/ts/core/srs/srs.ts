import {Feature} from '../settings'
import {SRSSignal, SRSSignals} from './scheduler'
import {SM2Node} from './SM2Node'
import {AnkiScheduler} from './AnkiScheduler'
import {Roam} from '../roam/roam'

export const config: Feature = {
    id: 'srs',
    name: 'Spaced Repetition',
    settings: SRSSignals.map(it => ({
        type: 'shortcut',
        id: `srs_${SRSSignal[it]}`,
        label: `SRS: ${SRSSignal[it]}`,
        initValue: `ctrl+shift+${it}`,
        onPress: () => rescheduleCurrentNote(it),
    })),
}

export function rescheduleCurrentNote(signal: SRSSignal) {
    const scheduler = new AnkiScheduler()
    Roam.applyToCurrent(node => scheduler.schedule(new SM2Node(node.text, node.selection), signal))
}
