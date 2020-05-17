import {Feature, Shortcut} from '../utils/settings'
import {SRSSignal, SRSSignals} from './scheduler'
import {SM2Node} from './SM2Node'
import {AnkiScheduler} from './AnkiScheduler'
import {RoamNode} from '../roam/roam-node'
import {Roam} from '../roam/roam'

export const config: Feature = {
    id: 'srs',
    name: 'Spaced Repetition',
    settings: [
        {
            type: 'shortcut',
            id: 'nextBucketShortcut',
            label: 'Trigger next bucket',
            initValue: 'Ctrl+q',
            onPress: triggerNextBucket,
        } as Shortcut,
    ].concat(
        SRSSignals.map(it => ({
            type: 'shortcut',
            id: `srs_${SRSSignal[it]}`,
            label: `SRS: ${SRSSignal[it]}`,
            initValue: `ctrl+shift+${it}`,
            onPress: () => rescheduleCurrentNote(it),
        }))
    ),
}

export function rescheduleCurrentNote(signal: SRSSignal) {
    const scheduler = new AnkiScheduler()
    Roam.applyToCurrent(node => scheduler.schedule(new SM2Node(node.text, node.selection), signal))
}

const bucketExpr = /(?:\[\[\[\[interval]]::(\d+)]])|(?:#Box(\d+))/gi
const nextBucket = (nodeStr: string) => `[[[[interval]]::${parseInt(nodeStr) + 1}]]`

export function triggerNextBucket() {
    Roam.applyToCurrent(
        element =>
            new RoamNode(
                element.text.replace(bucketExpr, (_, ...numbers) => nextBucket(numbers.filter(it => it)[0])),
                element.selection
            )
    )
}
