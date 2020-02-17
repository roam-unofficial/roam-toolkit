import { browser } from 'webextension-polyfill-ts';
import {
  getTopLevelBlockList,
  getInputEvent,
  simulateMouseClick,
  pressESC,
  pressEnter,
  pressBackspace,
  getActiveEditElement,
  pressShiftTab
} from '../../utils/dom';

const create = async () => {
  //get last block from list
  let lastChild = getTopLevelBlockList().lastChild as HTMLElement;
  let lastBlock = lastChild.querySelector('.roam-block') as HTMLElement;

  // click on block to trigger textarea
  // not needed if lastblock is already selected
  if (lastBlock) {
    console.log('lastBlock: ', lastBlock);
    await simulateMouseClick(lastBlock);
    // await asyncMouseClick(lastBlock);
  }

  //mouse click changes dom so we need to get last block again
  let element = getActiveEditElement() as HTMLTextAreaElement;

  if (element) {
    console.log('element: ', element);
    console.log('value', element.value);

    //move selection to the end of the line
    element.setSelectionRange(
      element.value.length * 2,
      element.value.length * 2
    );

    // add css rule to hide the next block before it is created
    let ss = document.styleSheets[0] as CSSStyleSheet;
    let numChildren = getTopLevelBlockList().children.length;
    ss.insertRule(`.roam-article div .flex-v-box:nth-child(${numChildren+1}) {  width: 0px; overflow: hidden }`)

    // press enter to create new block
    await pressEnter();
    // ShiftTab guarantees the new block is a top level block
    await pressShiftTab();
    
    // hide it
    // lastChild = getTopLevelBlockList().lastChild as HTMLElement;
    // lastChild.style.visibility = 'hidden';


    // element = getActiveEditElement() as HTMLTextAreaElement;
    lastChild = getTopLevelBlockList().lastChild as HTMLElement;
    element = lastChild.querySelector('textarea') as HTMLTextAreaElement;
  

    if (element.nodeName === 'TEXTAREA') {
      // const blockContent = element.value;
      console.log(element.id);
      // writing to active block
      element.value = 'new block' + element.id.split('-').pop();
      
      // try testing with query
      //   element.value = ':q [:find ?a ?b :where [?a :node/title ?b]]';
      element.dispatchEvent(getInputEvent());
      console.log('writing to element');

      // unfocus block
      // esc enters into block selection mode
      await pressESC(element);

      // resulting table from query
      const table = lastChild.querySelector('table');
      if (table) {
          console.log(table);
          const rows = table && Array.from(table.rows);
          console.log(rows);
      }

      // block is selected, now either:
      // leave block selection mode with ESC
    //   await pressESC(element);
      // or delete block with Backspace
      await pressBackspace();

      ss.deleteRule(0);
    }
  }
};

browser.runtime.onMessage.addListener(command => {
  if (command === 'create-block') {
    create();
  }
});
