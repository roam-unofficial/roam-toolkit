
## Intro

**Roam Toolkit** is written using [WebExtensions API](https://extensionworkshop.com/documentation/develop/about-the-webextensions-api/) to ensure that it can run on both Chrome and Firefox.  
It's written in [TypeScript](https://www.typescriptlang.org/) - a superset of JavaScript that introduces support 
for static typing.

### Prerequisites

1. You need to set up `NodeJS` and `npm` on your machine to be able to build the extension. 
Follow this guide to set them up: https://www.taniarascia.com/how-to-install-and-use-node-js-and-npm-mac-and-windows/

1. (__**Optional**__) As mentioned above the plugin is written in TypeScript - so going through short 
introduction to the language, if you're not familiar with it yet, will prove useful.   
https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes.html is a short official introduction. 
And there is a lot of material out there if you want to learn more!

1. Get a good editor 😉. My favorite is [WebStorm](https://www.jetbrains.com/webstorm/). [VS Code](https://code.visualstudio.com/) is pretty good too.


## Running the plugin in development mode

1. Clone the repository  

    `git clone https://github.com/roam-unofficial/roam-toolkit.git`

1. Revert the https://github.com/roam-unofficial/roam-toolkit/commit/20ad9560b7cfaf71adf65dbc3645b3554c2ab598 change locally to allow Toolkit to properly run in the development mode.   
  This is awkward, but required because of how react development tools work 😞. Make sure not to 
  commit these changes back to the repository. 
  
    `git revert --no-commit 20ad9560b7cfaf71adf65dbc3645b3554c2ab598 && git reset src/manifest.json`
  
1. Install dependencies by running  
  `npm install`

1. Build the plugin. Here you have two options:
    * `npm run dev` - run one time build
    * `npm run watch` - continuously watch for changes in your source code and rebuild the plugin & 
  reload it in the browser. This mode is great for continuous iteration as it introduces a minimal 
  friction between making a change and seeing the result. It'll even reload the browser page for you 
  where the plugin is loaded, to ensure that your changes are applied.
  
1. [Load the extension in the browser](https://github.com/roam-unofficial/roam-toolkit#load-extension-into-the-browser) 
 
 
 
 
## Example feature with settings

Let's take a look at a simple example feature to understand on how you can go about adding a new one
in such a way that it'd integrate with the settings menu.  
The example feature would be a shortcut to **copy block reference** of the block. 

To implement this feature we'll need to do the following things:  
1. Create a file in [features](https://github.com/roam-unofficial/roam-toolkit/tree/master/src/ts/core/features)
directory that contains feature description and implementation. Here is an example: 

    ```typescript
    import {Feature, Shortcut} from '../settings/settings'
   
    export const config: Feature = { // An object that describes new feature we introduce
        id: 'block_manipulation',  // Feature id - any unique string would do
        name: 'Block manipulation',  // Feature name - would be displayed in the settings menu
        settings: [ // List of settings for the feature
            {
                type: 'shortcut', // Type of the setting. See other ones defined here: https://github.com/roam-unofficial/roam-toolkit/blob/master/src/ts/core/settings/settings.ts#L36 
                id: 'copyBlockRef', // Id of the setting - any unique string would do
                label: 'Copy Block Reference',  // Shortcut name - would be displayed in setting menu
                initValue: 'ctrl+shift+c',  // Initial shortcut value
                // This defines what function would be called when shortcut is pressed 
                onPress: () => navigator.clipboard.writeText(getCurrentBlockReference()), 
            } as Shortcut,
        ],
    }

    function getCurrentBlockReference () {
      // code that retrieves current block reference
    }
    ```
   
   The original code for this feature can be found at https://github.com/roam-unofficial/roam-toolkit/blob/master/src/ts/core/features/block-manipulation.ts#L5

1. Add the newly defined feature to the list of all features to be loaded [here](https://github.com/roam-unofficial/roam-toolkit/blob/master/src/ts/core/features/features.ts#L12).  

    For our block manipulation feature it'd look like:
    ```typescript
    // Import the feature we've created
    import {config as blockManipulation} from './block-manipulation'

    //...
    // Add it to the list of all features
       all: prepareSettings([
           //...   
           blockManipulation,
       ]), 
    ``` 
   
1. You should have your new shiny feature working now 🎉

### Bare minimum example (without settings):

1. Create a TypeScript file anywhere in [core directory](https://github.com/roam-unofficial/roam-toolkit/tree/master/src/ts/core)

    ```typescript
    alert("Hello World!")
    ```
2. Import your file from [this file](https://github.com/roam-unofficial/roam-toolkit/blob/master/src/ts/contentScripts/entry/index.ts) to ensure it's loaded with the plugin

   It'd look something like `import '../../features/hello_world'`
   
1. You should have your new shiny hello world now 🎉

## Code structure
* [Main source dir](https://github.com/roam-unofficial/roam-toolkit/tree/master/src/ts)
* [Tests](https://github.com/roam-unofficial/roam-toolkit/tree/master/tests/ts)

### Entry point

[src/ts/contentScripts/entry/index.ts](https://github.com/roam-unofficial/roam-toolkit/blob/master/src/ts/contentScripts/entry/index.ts) Is the entry-point file for the extension. For code to be
 loaded/executed - it has to be directly or transitively be imported from this file. 

### Features directory 

[/src/ts/core/features/](https://github.com/roam-unofficial/roam-toolkit/tree/master/src/ts/core/features) 
directory contains entry point for all the features in the Toolkit. 


starting point for exploring

### Roam interaction utils

1. short summary of utils/abstractions available

## Unit testing

* 

