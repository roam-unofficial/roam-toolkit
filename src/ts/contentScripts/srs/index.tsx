import { Roam, RoamNode } from '../../utils/roam';
import { Feature } from '../../utils/settings'

export const config: Feature = {
    id: 'srs',
    name: 'SRS',
    shortcuts: [
        {
            id: 'nextBucketShortcut', label: 'Trigger next bucket', initValue: 'Ctrl+s',
            onPress: triggerNextBucket
        }
    ]
}

const bucketExpr = /\[\[Bucket (\d+)]]/;
const nextBucket = (nodeStr: string) => `[[Bucket ${parseInt(nodeStr) + 1}]]`;

export function triggerNextBucket() {
    Roam.applyToCurrent(
        (element => {
            return new RoamNode(element.text.replace(bucketExpr, (_, numStr: string) => nextBucket(numStr)),
                element.selection);
        }));
}
