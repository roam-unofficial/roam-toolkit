import {Feature, Settings} from '../settings'
import {browser} from 'webextension-polyfill-ts'

export const config: Feature = {
    id: 'filter_search',
    name: 'Search in page/reference filter',
    enabledByDefault: true,
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
    if (active) {
        document.addEventListener('click', filterSearch)
    } else {
        document.removeEventListener('click', filterSearch)
    }
}

function filterSearch(event: MouseEvent) {
    const eventTarget = event.target as HTMLElement
    if (eventTarget !== null) {
        console.log(eventTarget.className)

        if (eventTarget.className === 'bp3-button') {
            const tbInputSearch = document.getElementById('fbSearchInput') as HTMLInputElement
            if (tbInputSearch !== null) {
                tbInputSearch.focus()
                tbInputSearch.select()
            }
        } else if (
            eventTarget.className === 'bp3-icon bp3-icon-filter' ||
            eventTarget.className === 'bp3-button bp3-minimal bp3-small'
        ) {
            let waitCtr = 0

            function waitForFilter() {
                setTimeout(() => {
                    // Check if filter search input box is there, otherwise need to load it
                    const tbInputSearch = document.getElementById('fbSearchInput') as HTMLInputElement

                    if (tbInputSearch === null) {
                        const allByClassTest = document.querySelectorAll(
                            'div.bp3-transition-container.bp3-popover-enter-done div.bp3-popover-content > div > div'
                        )
                        const testFilterDiv = allByClassTest[0] as HTMLElement
                        if (typeof testFilterDiv !== 'undefined' && testFilterDiv !== null) {
                            const newDivLine = document.createElement('div')
                            newDivLine.className = 'rm-line'
                            testFilterDiv.prepend(newDivLine)

                            const newDiv = document.createElement('div')
                            newDiv.id = 'filterBoxSearch'
                            newDiv.style.cssText = 'display:flex;padding:4px'
                            testFilterDiv.prepend(newDiv)

                            const newLabel = document.createElement('strong')
                            newLabel.innerText = 'Search'
                            newLabel.style.cssText = 'margin-right:10px'
                            newDiv.appendChild(newLabel)

                            const newInput = document.createElement('input')
                            newInput.value = ''
                            newInput.id = 'fbSearchInput'
                            newInput.name = 'fbSearchInput'
                            newInput.style.cssText = 'width:200px;display:flex'
                            newDiv.appendChild(newInput)
                            newInput.focus()

                            newInput.addEventListener('input', newInputClick)
                            return
                        } else {
                            console.log('Filter box was not loaded in time!')
                        }
                    }
                    waitCtr++
                    console.log('*** WAIT LOOP: ', waitCtr)
                    if (waitCtr >= 12) {
                        return
                    }
                    waitForFilter()
                }, 50)
            }

            waitForFilter()
        }
    }
}

function newInputClick() {
    const inputTxtVal = (document.getElementById('fbSearchInput') as HTMLInputElement).value.toString()
    console.log(inputTxtVal)

    // Get filter box (only works when opened)
    const allByClass2 = document.querySelectorAll('.bp3-overlay.bp3-overlay-open.bp3-overlay-inline')
    const filterBox = allByClass2[0]
    if (typeof filterBox !== 'undefined') {
        const allFilterButtons = filterBox.querySelectorAll('div:not(.flex-h-box) > div > button.bp3-button')

        for (let i = 0; i < allFilterButtons.length; i++) {
            const curElement = allFilterButtons.item(i) as HTMLElement

            if (inputTxtVal !== '') {
                const curElemText = curElement.innerText.toString().toLowerCase()
                if (curElemText.indexOf(inputTxtVal.toLowerCase()) > -1) {
                    curElement.style.display = 'inline-flex'
                } else {
                    curElement.style.display = 'none'
                }
            } else {
                curElement.style.display = 'inline-flex'
            }
        }
    } else {
        console.log('filter box is NOT open')
    }
}
