import {RoamDate} from '../roam/date'

const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

const getDayFromDate = (name: string) => {
    let re = /(.*) (\d+).{2}, (\d{4})/i
    const matches = name.match(re)
    if (matches && matches.length === 4) {
        const date = RoamDate.parse(name)
        return RoamDate.getDayName(date)
    }
    return null
}

const isElementPageViewTitle = (element: HTMLElement) =>
    (element.parentNode?.parentNode as HTMLElement)?.classList?.contains('rm-ref-page-view-title')

document.querySelector('body')?.addEventListener('mouseover', ev => {
    const target = ev.target as HTMLElement
    if (target === null) {
        return
    }

        let day = null
        if (target.classList.contains('rm-page-ref') || isElementPageViewTitle(target)) {
        day = getDayFromDate(target.innerText)
    }

        if (day === null) {
        return
    }
    target.setAttribute('title', day)
})
}
