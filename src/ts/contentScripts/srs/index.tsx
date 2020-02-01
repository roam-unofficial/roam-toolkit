import {Roam, RoamNode} from '../../utils/roam';

const bucketExpr = /\[\[Bucket (\d+)]]/;
const nextBucket = (nodeStr: string) => `[[Bucket ${parseInt(nodeStr) + 1}]]`;

export function triggerNextBucket() {
    Roam.applyToCurrent((element =>
        new RoamNode(element.text.replace(bucketExpr, (_, numStr: string) => nextBucket(numStr)))));
}
