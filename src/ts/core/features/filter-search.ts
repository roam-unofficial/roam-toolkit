import {Feature, Settings} from '../settings'
import {browser} from 'webextension-polyfill-ts'
import {waitForSelectorToExist} from 'src/core/common/mutation-observer'
import {Selectors} from 'src/core/roam/selectors'

export const config: Feature = {
    id: 'filter_search',
    name: 'Search pages in page or references filter',
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

const searchInputId = 'roam-toolkit--searchInputBox'

const getSearchInput = (): HTMLInputElement | null => {
    return document.getElementById(searchInputId) as HTMLInputElement
}

async function filterSearch(event: MouseEvent) {
    const eventTarget = event.target as HTMLElement
    if (!eventTarget) return

    const filterPageButtonClicked = eventTarget.matches(Selectors.button)

    // The filter button is nested in the generic outer button and you can click either
    const filterActivationButtonClicked =
        eventTarget.matches(Selectors.filterButton) ||
        (eventTarget.firstChild as HTMLElement | null)?.matches(Selectors.filterButton)

    if (filterActivationButtonClicked) {
        await createSearchFilterElements()
    } else if (filterPageButtonClicked) {
        refocusSearchInput()
    }
}

function refocusSearchInput() {
    const searchInput = getSearchInput()
    if (searchInput) {
        searchInput.focus()
        searchInput.select()
        showButtonsMatchingQuery()
    }
}

async function createSearchFilterElements() {
    const filterContainer = await waitForSelectorToExist(
        'div.bp3-transition-container.bp3-popover-enter-done div.bp3-popover-content > div > div'
    )

    function createSeparator() {
        const newDivLine = document.createElement('div')
        newDivLine.className = 'rm-line'
        filterContainer.prepend(newDivLine)
    }

    createSeparator()

    function createSearchElementsContainer() {
        const container = document.createElement('div')
        container.id = 'filterBoxSearch'
        container.style.cssText = 'display:flex;padding:4px'
        filterContainer.prepend(container)
        return container
    }

    const searchElementsContainer = createSearchElementsContainer()

    function createSearchLabel() {
        const searchLabel = document.createElement('strong')
        searchLabel.innerText = 'Search'
        searchLabel.style.cssText = 'margin-right:10px'
        searchElementsContainer.appendChild(searchLabel)
    }

    createSearchLabel()

    function createSearchInput() {
        const searchInput = document.createElement('input')
        searchInput.value = ''
        searchInput.id = searchInputId
        searchInput.name = searchInputId
        searchInput.style.cssText = 'width:200px;display:flex'
        searchElementsContainer.appendChild(searchInput)

        searchInput.addEventListener('input', showButtonsMatchingQuery)
    }

    createSearchInput()
    refocusSearchInput()
}

function showButtonsMatchingQuery() {
    const filterButtonsContainer = document.querySelector('.bp3-overlay.bp3-overlay-open.bp3-overlay-inline')
    const filterButtons =
        filterButtonsContainer?.querySelectorAll('div:not(.flex-h-box) > div > button.bp3-button') || []

    const searchText = getSearchInput()?.value?.toString()?.toLowerCase()

    filterButtons.forEach((button: Element) => updateButtonVisibility(button as HTMLElement, searchText))
}

function updateButtonVisibility(button: HTMLElement, searchText: string | undefined) {
    const show = () => (button.style.display = 'inline-flex')
    const hide = () => (button.style.display = 'none')

    const buttonText = button.innerText.toString().toLowerCase()
    if (searchText && !buttonText.includes(searchText)) {
        hide()
    } else {
        show()
    }
}
