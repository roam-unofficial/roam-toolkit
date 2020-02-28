import {Roam, RoamNode} from '../../utils/roam';
import {Feature, Shortcut} from '../../utils/settings'
import {AnkiScheduler, SRSSignal, SRSSignals} from '../../srs/scheduler';
import {SM2Node} from '../../srs/SM2Node';

export const config: Feature = {
    id: 'srs',
    name: 'SRS',
    settings: [
        {
            type: 'shortcut',
            id: 'nextBucketShortcut',
            label: 'Trigger next bucket',
            initValue: 'Ctrl+q',
            onPress: triggerNextBucket
        } as Shortcut
    ].concat(SRSSignals.map(it => {
        return {
            type: 'shortcut', id: `srs_${SRSSignal[it]}`, label: `SRS: ${SRSSignal[it]}`, initValue: `ctrl+shift+${it}`,
            onPress: () => rescheduleCurrentNote(it)
        }
    }))
}

export function rescheduleCurrentNote(signal: SRSSignal) {
    const scheduler = new AnkiScheduler()
    Roam.applyToCurrent(node => scheduler.schedule(new SM2Node(node.text, node.selection), signal))
}

const bucketExpr = /(?:\[\[\[\[interval]]::(\d+)]])|(?:#Box(\d+))/gi;
const nextBucket = (nodeStr: string) => `[[[[interval]]::${parseInt(nodeStr) + 1}]]`;

export function triggerNextBucket() {
    Roam.applyToCurrent(
        (element =>
            new RoamNode(
                element.text.replace(bucketExpr,
                    (_, ...numbers) => nextBucket(numbers.filter(it => it)[0])),
                element.selection)));
}