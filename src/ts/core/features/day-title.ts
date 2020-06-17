import {RoamDate} from '../roam/date'

const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

function getDayFromDate(name: string) {
    let re = /(.*) (\d+).{2}, (\d{4})/i
    var matches = name.match(re)
    if (matches && matches.length === 4) {
        const d = RoamDate.parse(name)
        return days[d.getDay()]
    }
    return null
}

function isPageViewTitle(element: HTMLElement) {
    return (
        element.parentNode &&
        element.parentNode.parentNode &&
        (element.parentNode.parentNode as Element).classList.contains('rm-ref-page-view-title')
    )
}

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
