import { DOM } from '../../utils/dom';
import { Roam} from '../../utils/roam';

export const createDemo = async () => {
    await Roam.createBlockAtBottom(false, 'bottom-block');

    await Roam.createBlockAtTop(false, 'top-block');
    await Roam.createFirstChild('first child');
    await Roam.createFirstChild('grandchild');

    await Roam.activateBlock(DOM.getFirstTopLevelBlock());
    await Roam.createLastChild('second child');
    await Roam.createFirstChild('grandchild');
    
    await Roam.activateBlock(DOM.getFirstTopLevelBlock());
    await Roam.createDeepestLastDescendant('deepest descendant*');
    
    await Roam.activateBlock(DOM.getFirstTopLevelBlock());
    await Roam.createSiblingBelow('3rd top block');
    await Roam.createSiblingAbove('2nd top block');
};
