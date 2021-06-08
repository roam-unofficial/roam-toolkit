<div align="center">

# Roam Toolkit - [Roam](https://roamresearch.com) force multiplier

</div>

Browser extension designed to improve your experience of using Roam Research

---
The development is supported by <a href="https://roam.garden/"> <img src="https://roam.garden/static/logo-2740b191a74245dc48ee30c68d5192aa.svg" height="50" /></a> - a service that allows you to publish your Roam notes as a beautiful static website (digital garden)

---

## WalkThrough

[![Watch the video](https://img.youtube.com/vi/llP-3AqFGL8/maxresdefault.jpg)](https://youtu.be/llP-3AqFGL8)

[Document in the video](./media/walkthough_0.1.md)

## Installation
It's available in their respective extension stores for both [Chrome](https://chrome.google.com/webstore/detail/roam-toolkit/ebckolanhdjilblnkcgcgifaikppnhba)  & [Firefox](https://addons.mozilla.org/en-US/firefox/addon/roam-toolkit/)

## Features

### Date Manipulation

You can create dates using [**natural language**](https://github.com/wanasit/chrono):

![](./media/fuzzy_date.gif)

Replace mode: 

![](.media/fuzzy_date_replace.gif)

You can also **increment or decrement dates**:

* While editing a block, press `Ctrl-Alt-Up/Down` to increment/decrement any date inside. If a block has multiple dates, place your cursor on the date.
    
### Spaced Repetition

Implements SM2 Spaced repetition algorithm (Anki version) as described here: https://docs.ankiweb.net/#/faqs?id=what-spaced-repetition-algorithm-does-anki-use for Roam blocks.  
Put a cursor inside the block and pres Ctrl+Shift+ [number between 1 and 4 signifying ease of remembering this card], and the plugin is going to reschedule the Block accordingly (tagging it with the appropriate date, and some metadata tags)

Watch the video for more details:
[![Watch the video for details on how to use it](https://img.youtube.com/vi/08o8q_bOedw/maxresdefault.jpg)](https://youtu.be/08o8q_bOedw)

### Live Preview of pages

![](./media/live_preview.gif)

### Vim Style keyboard shortcuts

![](./media/vim_demo.gif)

For more details, see the [full video](https://youtu.be/ZxtT05CjOyo)

### Spatial Graph Sidebar

You can layout sidebar pages in a mind map ([Full Video](https://youtu.be/Yc1T0micgzk)):

![](./media/spatial_mode.gif)

Use the keyboard to navigate. Also save and restore layouts with `Ctrl+Shift+s`/`Ctrl+Shift+o`:

![](./media/spatial_save_and_restore.gif)

[Firefox isn't supported yet](https://github.com/cytoscape/cytoscape.js-cola/issues/51)

### Other Features

1. Block actions: Delete, Duplicate, Copy Block Reference
1. Task estimates

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for details on how to start contributing.

## Running the development version

1. Checkout the repository

2. In terminal or command prompt run the following commands:

    ```bash
    npm install # Install dependencies
    npm run prod # Transpile the code
    ```

### Load extension into the browser

#### Chrome
1. Go to: [**chrome://extensions**](chrome://extensions)
2. Toggle: "**developer mode**" on.
3. Click on: "**Load unpacked**"
4. Select the newly created folder "**dist**" from the project folder.
5. That's it.

#### Firefox
1. Go to: [**about:debugging**](about:debugging)
2. Select: "**Enable add-on debugging**"
3. Click on: "**Load Temporary Add-on…**"
4. Open the newly created folder "**dist**" from the project folder, and choose the "**manifest.json**" file.
5. That's it.
