import {Roam} from '../../utils/roam';

const bucketExpr = /\[\[Bucket (\d+)]]/;
const nextBucket = (nodeStr: string) => `[[Bucket ${parseInt(nodeStr) + 1}]]`;

export function triggerNextBucket() {
    const roamElement = Roam.getActiveRoamNode();
    if (!roamElement) return;

    roamElement.text = roamElement.text.replace(bucketExpr, (_, numStr: string) => nextBucket(numStr));
}
