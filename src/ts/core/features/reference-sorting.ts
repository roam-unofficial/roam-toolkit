import {Feature} from '../settings'

export const config: Feature = { // An object that describes new feature we introduce
    id: 'reference-sorting',  // Feature id - any unique string would do
    name: 'Reference Sorting',  // Feature name - would be displayed in the settings menu
    warning: 'Experimental feature',
    enabledByDefault: false,
}