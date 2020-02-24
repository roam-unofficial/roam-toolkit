import {Roam, RoamNode} from '../../utils/roam';
import {Feature, Shortcut} from '../../utils/settings'

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
    ]
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