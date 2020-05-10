import {Feature, Settings} from '../../utils/settings'
import {RoamDate} from '../../date/common'
import {Navigation} from '../../roam/navigation'

export const config: Feature = {
    id: 'live_preview',
    name: 'Live Preview',
    settings: [],
}

Settings.isActive('live_preview').then(active => {
    if (active) {
        console.log('live view active!')
        enableLivePreview()
    }
})
const createPreviewIframe = () => {
    const iframe = document.createElement('iframe')
    const currentDate = new Date()
    // Tomorrow starts at 2am for the purposes of this
    currentDate.setHours(currentDate.getHours() - 2)

    const url = Navigation.getPageUrl(RoamDate.format(currentDate))
    const isAdded = (pageUrl: string) => !!document.querySelector(`[src="${pageUrl}"]`)
    if (isAdded(url)) {
        return
    }
    iframe.src = url
    iframe.style.position = 'absolute'
    iframe.style.left = '0'
    iframe.style.top = '0'
    iframe.style.opacity = '0'
    iframe.style.height = '0'
    iframe.style.width = '0'
    iframe.style.border = '0'
    iframe.style.boxShadow = '0 0 4px 5px rgba(0, 0, 0, 0.2)'
    iframe.style.borderRadius = '4px'
    iframe.id = 'roam-toolkit-preview-iframe'

    const styleNode = document.createElement('style')
    styleNode.innerHTML = `
        .roam-topbar {
            display: none !important;
        }
        .roam-body-main {
            top: 0px !important;
        }
        #buffer {
            display: none !important;
        }
        iframe {
            display: none !important;
        }
    `
    iframe.onload = (event: Event) => {
        ;(event.target as HTMLIFrameElement).contentDocument?.body.appendChild(styleNode)
    }
    console.log({iframe})
    document.body.appendChild(iframe)
    return iframe
}
const enableLivePreview = () => {
    let hoveredElement: HTMLElement | null
    let popupTimeout: ReturnType<typeof setTimeout> | null
    const previewIframe = createPreviewIframe()
    document.addEventListener('mouseover', (e: Event) => {
        const target = e.target as HTMLElement
        const isPageRef = target.classList.contains('rm-page-ref')
        if (isPageRef) {
            hoveredElement = target
            const url = Navigation.getPageUrlByName(target.innerText)
            const isAdded = (pageUrl: string) => !!document.querySelector(`[src="${pageUrl}"]`)
            const isVisible = (pageUrl: string) =>
                (document.querySelector(`[src="${pageUrl}"]`) as HTMLElement)?.style.opacity === '1'
            if (!popupTimeout && (!isAdded(url) || !isVisible(url))) {
                popupTimeout = window.setTimeout(() => {
                    console.log({isVisible: isVisible(url), isAdded: isAdded(url)})
                    if (
                        hoveredElement &&
                        hoveredElement === target &&
                        (!isAdded(url) || !isVisible(url)) &&
                        previewIframe
                    ) {
                        console.log(hoveredElement, target, previewIframe)
                        const rect = target.getClientRects()[0]
                        const x = `${rect.x + rect.width}px`
                        const y = `${rect.y + rect.height}px`
                        previewIframe.src = url
                        previewIframe.style.left = x
                        previewIframe.style.top = y
                        previewIframe.style.height = '500px'
                        previewIframe.style.width = '500px'
                        previewIframe.style.opacity = '1'
                    }
                }, 400)
            }
        }
    })
    document.addEventListener('mouseout', (e: Event) => {
        const target = e.target as HTMLElement
        if (hoveredElement === target) {
            hoveredElement = null
            clearTimeout(popupTimeout as ReturnType<typeof setTimeout>)
            popupTimeout = null
            const iframe = document.getElementById('roam-toolkit-preview-iframe')
            if (iframe) {
                iframe.style.opacity = '0'
                iframe.style.height = '0'
                iframe.style.width = '0'
            }
        }
    })
}
