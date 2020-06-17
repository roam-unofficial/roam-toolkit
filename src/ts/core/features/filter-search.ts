import {Feature, Settings} from '../settings'
import {browser} from 'webextension-polyfill-ts'

export const config: Feature = { // An object that describes new feature we introduce
    id: 'filter_search',  // Feature id - any unique string would do
    name: 'Filter Search',  // Feature name - would be displayed in the settings menu
    //warning: 'Experimental feature',
    enabledByDefault: false,
}

const checkSettingsAndSetupFilterSearchToggle = () => {
    Settings.isActive('filter_search').then(active => {
        toggleFilterSearch(active)
    })
}
checkSettingsAndSetupFilterSearchToggle()

browser.runtime.onMessage.addListener(async message => {
    if (message === 'settings-updated') {
        checkSettingsAndSetupFilterSearchToggle()
    }
})

const toggleFilterSearch = (active: boolean) => {
    const jsDoc = document;
    if (active) {
        jsDoc.addEventListener("click", filterSearch);
    } else {
        jsDoc.removeEventListener("click", filterSearch);
    }
}

var debugMode = 0;

function filterSearch(evt: MouseEvent)
{
    var evtTarget = (<HTMLElement>evt.target);
    if(evtTarget !== null)
    {
        if(debugMode == 1){console.log(evtTarget.className);}

        if(evtTarget.className === 'bp3-button')
        {
            var tbInputSearch = (<HTMLInputElement>document.getElementById("fbSearchInput"));
            if(tbInputSearch !== null)
            {
                tbInputSearch.focus();
                tbInputSearch.select();
            }
        }
        else if(evtTarget.className === 'bp3-icon bp3-icon-filter' || evtTarget.className === 'bp3-button bp3-minimal bp3-small')
        {
            var waitCtr = 0;
            function waitForFilter()
            {
                setTimeout(function(){
                    //Check if filter search input box is there, otherwise need to load it
                    var tbInputSearch = (<HTMLInputElement>document.getElementById("fbSearchInput"));

                    if(tbInputSearch === null)
                    {
                        var allByClassTest = document.querySelectorAll('div.bp3-transition-container.bp3-popover-enter-done div.bp3-popover-content > div > div');
                        var testFilterDiv = (<HTMLElement>allByClassTest[0]);
                        if(typeof testFilterDiv !== 'undefined' && testFilterDiv !== null)
                        {
                            var newDivLine = document.createElement('div');
                                newDivLine.className = 'rm-line';
                                testFilterDiv.prepend(newDivLine);

                            var newDiv = document.createElement('div');
                                newDiv.id = 'filterBoxSearch';
                                newDiv.style.cssText = 'display:flex;padding:4px';
                                testFilterDiv.prepend(newDiv);

                            var newLabel = document.createElement('strong');
                                newLabel.innerText = 'Search';
                                newLabel.style.cssText = 'margin-right:10px';
                                newDiv.appendChild(newLabel);

                            var newInput = document.createElement('input');
                                newInput.value = '';
                                newInput.id = 'fbSearchInput';
                                newInput.name = 'fbSearchInput';
                                newInput.style.cssText = 'width:200px;display:flex';
                                newDiv.appendChild(newInput);
                                newInput.focus();

                            newInput.addEventListener("input", newInputClick);
                            return;
                        }else{if(debugMode == 1){console.log('Filter box was not loaded in time!')}}
                    }
                    waitCtr++;
                    if(debugMode == 1){console.log('*** WAIT LOOP: ',waitCtr)}
                    if(waitCtr >= 12){return;}
                    waitForFilter();
                }, 50)
            }

            waitForFilter();
        }
    }
}

function newInputClick()
{
    var inputTxtVal = (<HTMLInputElement>document.getElementById("fbSearchInput")).value.toString();
    if(debugMode == 1){console.log(inputTxtVal);}

    //Get filter box (only works when opened)
    var allByClass2 = document.querySelectorAll('.bp3-overlay.bp3-overlay-open.bp3-overlay-inline');
    var filterBox = allByClass2[0];
    if(typeof filterBox !== "undefined")
    {
        var allFilterButtons = filterBox.querySelectorAll('div:not(.flex-h-box) > div > button.bp3-button');

        for(var i = 0; i < allFilterButtons.length; i++)
        {
            var curElement = allFilterButtons.item(i);

            if(inputTxtVal !== '')
            {
                var curElemText = (<HTMLElement>curElement).innerText.toString().toLowerCase();
                if(curElemText.indexOf(inputTxtVal.toLowerCase()) > -1){(<HTMLElement>curElement).style.display = "inline-flex"}else{(<HTMLElement>curElement).style.display = "none"}
            }else{(<HTMLElement>curElement).style.display = "inline-flex"}
        }
    }else
    {
        if(debugMode == 1){console.log('filter box is NOT open');}
    }
}
