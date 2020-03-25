import {getFirstTopLevelBlock} from '../../utils/dom';
import {Roam} from '../../roam/roam';

export const createDemo = async () => {
    await Roam.createBlockAtBottom();
    Roam.writeText('bottom-block');

    await Roam.createBlockAtTop();
    Roam.writeText('top-block');
    
    await Roam.createFirstChild();
    Roam.writeText('first child');
    
    await Roam.createFirstChild();
    Roam.writeText('grandchild');
    
    await Roam.activateBlockFromElement(getFirstTopLevelBlock());
    await Roam.createLastChild();
    Roam.writeText('second child');
    
    await Roam.createFirstChild();
    Roam.writeText('grandchild');
    
    await Roam.activateBlockFromElement(getFirstTopLevelBlock());
    await Roam.createDeepestLastDescendant()
    Roam.writeText('deepest descendant*');
    
    await Roam.activateBlockFromElement(getFirstTopLevelBlock());
    await Roam.createSiblingBelow()
    Roam.writeText('3rd top block');
    
    await Roam.createSiblingAbove()
    Roam.writeText('2nd top block');
};
