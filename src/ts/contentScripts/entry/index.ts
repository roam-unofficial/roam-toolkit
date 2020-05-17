/**
 * this is a single entry file for all content scripts to be loaded
 * nto the page once
 * any file to be loaded, should be present
 *  either in /feature.ts (if it's a new feature), or dispatcher/index.ts (it you want to inject globally)
 */

/**
 * Use dispatcher for global stuff, like keyboard shortcuts.
 * Let features handle their own dispatches. This decouples the code too.
 * Maybe make a seperate observer pattern for the same.
 */

import '../features'
import '../dispatcher'
