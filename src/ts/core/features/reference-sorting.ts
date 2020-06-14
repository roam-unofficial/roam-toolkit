import {browser} from 'webextension-polyfill-ts'
import {Feature, Settings} from '../settings'
import {RoamDate} from '../roam/date'

export const config: Feature = { // An object that describes new feature we introduce
    id: 'reference-sorting',  // Feature id - any unique string would do
    name: 'Reference Sorting',  // Feature name - would be displayed in the settings menu
    warning: 'Experimental feature',
    enabledByDefault: false,

    // TODO: add capability to enable/disable the various sorting modes (daily, date, etc.)
    // TODO: add setting for toggling sort for "Linked References" and "Unlinked References"
    settings: [

    ],
}

// TODO: remove debug mode + console.logs
const debug = true;


// TODO: need to refactor out the DOM Observer logic waiting for the Reference container to render before starting execution
const observer = new MutationObserver(() => {
    // TODO: find a better an more reliable selector to check for
    // TODO: refactor out class selectors
    if(document.querySelectorAll('.rm-reference-container > .flex-h-box').length) {
        checkSettingsAndSetupButtons()
        observer.disconnect()
    }
})

const startObservingDOM = () => observer.observe(document, { childList: true, subtree: true })
const stopObservingDOM = () => observer.disconnect()

startObservingDOM()


// TODO: handle reference filtering
// TODO: handle page navigation







// TODO: figure out a way to generalise this for all features, seems like boilerplate code
const checkSettingsAndSetupButtons = () => {
    Settings.isActive(config.id)
        .then((active) => {toggleReferenceSorting(active)})
}

browser.runtime.onMessage.addListener(async message => {
    if (message === 'settings-updated') {
        checkSettingsAndSetupButtons()
    }
})


const toggleReferenceSorting = (active: boolean) => {
    if(!active){
        return destructor()
    }

    constructor()
}

const constructor = () => {
    // TODO: find more explanatory icons
    createButtonElement('bp3-icon-sort-alphabetical', 'alphabetical')
    createButtonElement('bp3-icon-sort-numerical', 'daily')
}

const destructor = () => {
    // TODO: add logic for destroying the HTML elements and removing event listeners
}

const createSpan = (classes: string[]): HTMLElement => {
    const element = document.createElement('span')
    element.classList.add(...classes)
    
    return element
}

// Sorting button HTML (Blueprint 3):
// <span class="bp3-button bp3-minimal bp3-small rr-sort" tabindex="0">
//   <span class="bp3-icon bp3-icon-sort-alphabetical" id="alphabetical">/span>
// </span>

const createButtonElement = (icon: string, elementId: string) => {
    // TODO: create a configuration object for these classes
    const buttonContainerClasses = ['bp3-button', 'bp3-minimal', 'bp3-small', 'rr-sort']

    const buttonContainer = createSpan(buttonContainerClasses);
    buttonContainer.tabIndex = 0
    
    const buttonInnerElement = createSpan(['bp3-icon', icon])
    buttonInnerElement.id = elementId

    // TODO: store this state in a better way, this is just proof-of-concept
    let sortedAscending:boolean = false;
    console.log(icon, sortedAscending);


    buttonContainer.appendChild(buttonInnerElement)

    // TODO: refactor out class selectors
    document.querySelectorAll('.rm-reference-container > .flex-h-box').forEach(element => {
        element.appendChild(buttonContainer)
    })

    buttonContainer.addEventListener('click', (event: MouseEvent) => {
        if(debug) {
            console.log('click event received', event)
        }

        console.log('before', icon, sortedAscending);

        const referencesList = buttonContainer.parentNode?.nextSibling;
        if(!referencesList) {
            console.error('something went really wrong ...')
            return;
        }
        
        // TODO: refactor out class selectors
        let references = referencesList?.querySelectorAll(':scope > .rm-ref-page-view')

        // Remove reference elements from DOM
        // references.forEach(element => referencesList?.removeChild(element))
        
        // TODO: refactor out sorting function to allow for state management (asc/desc)
        references = Array.from(references)
            .sort((a, b) => {
                // TODO: find a cleaner way to do this
                // TODO: refactor out class selectors
                const elementAText: string = a.querySelector(':scope .rm-ref-page-view-title a span').textContent
                const elementBText: string = b.querySelector(':scope .rm-ref-page-view-title a span').textContent

                if (elementId === "alphabetical" || (!nameIsDate(elementAText) && !nameIsDate(elementBText)))
                    return elementAText.localeCompare(elementBText)

                if(nameIsDate(elementAText) && !nameIsDate(elementBText))
                    return (elementId === "daily") ? -1 : 1;
                
                if(!nameIsDate(elementAText) && nameIsDate(elementBText))
                    return (elementId === "daily") ? 1 : -1;

                return RoamDate.parseFromReference(elementBText).getTime() - RoamDate.parseFromReference(elementAText).getTime()
            })

        if(sortedAscending && elementId === "alphabetical") {
            references.reverse()
        }
        
        references.forEach((node: HTMLElement) => referencesList.appendChild(node))

        toggleIcon(buttonInnerElement, elementId);
        
        sortedAscending = !sortedAscending;
        console.log('after', icon, sortedAscending);
    })
}

const toggleIcon = (element: HTMLElement, sortType: string) => {
    if(sortType === "alphabetical"){
        element.classList.toggle('bp3-icon-sort-alphabetical-desc')
        element.classList.toggle('bp3-icon-sort-alphabetical')
    }

    if(sortType === "daily"){
        element.classList.toggle('bp3-icon-sort-numerical-desc')
        element.classList.toggle('bp3-icon-sort-numerical')
    }
}

// TODO: move Roam Date helper function to RoamDate.ts file
const nameIsDate = (pageName: string): boolean => pageName.match(/(January|February|March|April|May|June|July|August|September|October|November|December) \d{1,2}(st|nd|th|rd), \d{4}/gm) !== null