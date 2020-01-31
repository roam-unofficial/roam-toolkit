import { browser } from 'webextension-polyfill-ts';
import {
  getTopLevelBlockList,
  ValueElement,
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
  let lastChild = getTopLevelBlockList().lastChild as ValueElement;
  let lastBlock = lastChild.querySelector('.roam-block') as ValueElement;

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

    //move to the end of the line
    element.setSelectionRange(
      element.value.length * 2,
      element.value.length * 2
    );

    // press enter to create new block
    await pressEnter();
    // ShiftTab guarantees the new block is a top level block
    await pressShiftTab();

    element = getActiveEditElement() as HTMLTextAreaElement;

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
      await pressESC();

      // resulting table from query
      const table = lastChild.querySelector('table');
      if (table) {
          console.log(table);
          const rows = table && Array.from(table.rows);
          console.log(rows);
      }

      // block is selected, now either:
      // leave block selection mode with ESC
      await pressESC();
      // or delete block with Backspace
      // await pressBackspace();
    }
  }
};

browser.runtime.onMessage.addListener(command => {
  if (command === 'create-block') {
    create();
  }
});
