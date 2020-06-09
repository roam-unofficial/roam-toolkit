<div align="center">

# Roam Toolkit - [Roam](https://roamresearch.com) force multiplier

</div>

Browser extension designed to improve your experience of using Roam Research

## WalkThrough

[![Watch the video](https://img.youtube.com/vi/llP-3AqFGL8/maxresdefault.jpg)](https://youtu.be/llP-3AqFGL8)

[Document in the video](./media/walkthough_0.1.md)

## Installation
It's available in their respective extension stores for both [Chrome](https://chrome.google.com/webstore/detail/roam-toolkit/ebckolanhdjilblnkcgcgifaikppnhba)  & [Firefox](https://addons.mozilla.org/en-US/firefox/addon/roam-toolkit/)

## Currently supported functionality
1. Fuzzy Date functionality
  
  ![](./media/fuzzy_date.gif)
1. Date increment/decrement
    - If there is only 1 date in the block - place the cursor anywhere withing it and press `Ctrl-Alt-Up/Down`, if there is more then 1 date - you need to place the cursor within the name of the date.
1. Spaced repetition
   * Anki SRS algorithm & Shortcuts
   * Leitner System automation shortcuts 
1. Block actions: Delete, Duplicate, Copy Block Reference
1. Task estimates
1. Custom CSS
1. Live Preview of pages
 
 ![](./media/live_preview.gif)

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
