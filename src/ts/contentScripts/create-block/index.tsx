import { browser } from 'webextension-polyfill-ts';
import {
  getFirstTopLevelBlock
} from '../../utils/dom';
import { Roam} from '../../utils/roam';

export const create = async () => {
  //get last block from list
  //   let lastBlock = getLastTopLevelBlock();

  //   let lastChild = getTopLevelBlockList().lastChild as HTMLElement;
  //   console.log('lastChild: ', lastChild);
  //   let lastBlock = lastChild.querySelector('.roam-block') as HTMLElement;

  // click on block to trigger textarea
  //   // not needed if lastblock is already selected
  //   if (lastBlock) {
  //     console.log('lastBlock: ', lastBlock);
  //     await Mouse.leftClick(lastBlock, 10);
  // await asyncMouseClick(lastBlock);
  // }
  //   Roam.createSiblingBelow();
  //   Roam.createSiblingAbove();
    await Roam.createBlockAtBottom();
    await Roam.writeText('bottom-block');
    await Roam.createBlockAtTop();
    await Roam.writeText('top-block');
    await Roam.createFirstChild();
    await Roam.writeText('first child');
    await Roam.createFirstChild();
    await Roam.writeText('grandchild');
    // // // getFirstTopLevelBlock();
    await Roam.editBlock(getFirstTopLevelBlock());
    await Roam.createLastChild();
    await Roam.writeText('second child');
    await Roam.createFirstChild();
    await Roam.writeText('grandchild');
    // // getFirstTopLevelBlock();
    await Roam.editBlock(getFirstTopLevelBlock());
    await Roam.createDeepestLastDescendant()
    await Roam.writeText('deepest descendant*');
    // // getFirstTopLevelBlock();
    await Roam.editBlock(getFirstTopLevelBlock());
    // await Roam.createSiblingAbove()
    // // getFirstTopLevelBlock();
    await Roam.createSiblingBelow()
    await Roam.writeText('3rd top block');
    await Roam.createSiblingAbove()
    await Roam.writeText('2nd top block');
    
  /*
    to create block at the bottom at current identation:
    - select last top level
    - click
    - esc
    - down arrow
    - enter
  */

  //mouse click changes dom so we need to get last block again
  //   let element = getActiveEditElement() as HTMLTextAreaElement;
  //   Roam.createSiblingBelow();
  //   Roam.createBlockAtBottom();
  //   Roam.moveCursorToEnd();

  //   if (element) {
  //     console.log('element: ', element);
  //     console.log('value', element.value);

  //     //move selection to the end of the line
  //     element.setSelectionRange(
  //       element.value.length * 2,
  //       element.value.length * 2
  //     );

  //     // add css rule to hide the next block before it is created
  //     // let ss = document.styleSheets[0] as CSSStyleSheet;
  //     // let numChildren = getTopLevelBlockList().children.length;
  //     // ss.insertRule(`.roam-article div .flex-v-box:nth-child(${numChildren+1}) {  width: 0px; overflow: hidden }`)

  //     // press enter to create new block
  // await Keyboard.pressEnter(20);
  //     // ShiftTab guarantees the new block is a top level block
  // await Keyboard.pressShiftTab(20);

  //     // hide it
  //     // lastChild = getTopLevelBlockList().lastChild as HTMLElement;
  //     // lastChild.style.visibility = 'hidden';

  //     // element = getActiveEditElement() as HTMLTextAreaElement;
  //     // lastChild = getTopLevelBlockList().lastChild as HTMLElement;
  //     // lastBlock = lastChild.querySelector('.roam-block') as HTMLElement;
  //     // element = lastBlock.querySelector('textarea') as HTMLTextAreaElement;

  //     if (element.nodeName === 'TEXTAREA') {
  //       // const blockContent = element.value;
  //       console.log(element.id);
  //       // writing to active block
  //       element.value = 'new block' + element.id.split('-').pop();

  //       // try testing with query
  //       //   element.value = ':q [:find ?a ?b :where [?a :node/title ?b]]';
  //       element.dispatchEvent(getInputEvent());
  //       console.log('writing to element');

  // unfocus block
  // esc enters into block selection mode
  //   await pressESC(element);
  //   await Keyboard.pressEsc(20);

  // resulting table from query
  //   const table = lastChild.querySelector('table');
  //   if (table) {
  //       console.log(table);
  //       const rows = table && Array.from(table.rows);
  //       console.log(rows);
  //   }

  // block is selected, now either:
  // leave block selection mode with ESC
  //   await pressESC(element);
  // or delete block with Backspace
  //   await Keyboard.pressBackspace();

  //   ss.deleteRule(0);
};
