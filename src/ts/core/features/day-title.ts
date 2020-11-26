import {RoamDate} from '../roam/date'
import {getDayName} from '../common/date'
import {Feature, Settings} from '../settings'
import {Browser} from 'src/core/common/browser'

export const config: Feature = {
    id: 'day-title',
    name: 'Daily Notes Day Titles',
}

Settings.isActive(config.id).then(active => {
    if (active) {
        registerEventListener()
    }
})

Browser.addMessageListener(async message => {
    if (message?.featureId === config.id) {
        registerEventListener()
    }
})

const getDayFromDate = (name: string) => {
    const re = /(.*) (\d+).{2}, (\d{4})/i
    const matches = name.match(re)
    if (matches && matches.length === 4) {
        const date = RoamDate.parse(name)
        return getDayName(date)
    }
    return null
}

const isElementPageViewTitle = (element: HTMLElement) =>
    (element.parentNode?.parentNode as HTMLElement)?.classList?.contains('rm-ref-page-view-title')

const registerEventListener = () => {
    document.querySelector('body')?.addEventListener('mouseover', ev => {
        const target = ev.target as HTMLElement
        if (target === null) {
            return
        }

        let day = null
        if (
            target.classList.contains('rm-page-ref') ||
            target.classList.contains(`rm-title-display`) ||
            isElementPageViewTitle(target)
        ) {
            day = getDayFromDate(target.innerText)
        }

        if (day === null) {
            return
        }
        target.setAttribute('title', day)
    })
}
