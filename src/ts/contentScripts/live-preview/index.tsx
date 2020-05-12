import {Feature, Settings} from '../../utils/settings'
import {RoamDate} from '../../date/common'
import {Navigation} from '../../roam/navigation'
import {browser} from 'webextension-polyfill-ts'
import {createPopper, Instance} from '@popperjs/core'

export const config: Feature = {
    id: 'live_preview',
    name: 'Live Preview',
    settings: [],
}

Settings.isActive('live_preview').then(active => {
    if (active) {
        enableLivePreview()
    }
})

browser.runtime.onMessage.addListener(async message => {
    if (message?.featureId === 'live_preview' && message?.type === 'toggle') {
        if (message.value) {
            enableLivePreview()
        } else {
            removeLivePreview()
        }
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
    iframe.style.pointerEvents = 'none'

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
        document.body.scrollTop = 0
        ;(event.target as HTMLIFrameElement).contentDocument?.body.appendChild(styleNode)
    }
    document.body.appendChild(iframe)
    return iframe
}
const enableLivePreview = () => {
    let hoveredElement: HTMLElement | null
    let currentElement: HTMLElement | null
    let popupTimeout: ReturnType<typeof setTimeout> | null
    let popper: Instance | null = null
    const previewIframe = createPreviewIframe()
    document.addEventListener('mouseover', (e: Event) => {
        const target = e.target as HTMLElement
        currentElement = target
        const isPageRef = target.classList.contains('rm-page-ref')
        if (isPageRef) {
            hoveredElement = target
            const url = Navigation.getPageUrlByName(target.innerText)
            const isAdded = (pageUrl: string) => !!document.querySelector(`[src="${pageUrl}"]`)
            const isVisible = (pageUrl: string) =>
                (document.querySelector(`[src="${pageUrl}"]`) as HTMLElement)?.style.opacity === '1'
            if (hoveredElement && hoveredElement === target && (!isAdded(url) || !isVisible(url)) && previewIframe) {
                previewIframe.src = url
                previewIframe.style.height = '500px'
                previewIframe.style.width = '500px'
                previewIframe.style.pointerEvents = 'none'
            }
            if (!popupTimeout) {
                popupTimeout = window.setTimeout(() => {
                    if (hoveredElement && hoveredElement === target && previewIframe) {
                        // previewIframe.style.pointerEvents = 'none'
                        previewIframe.style.opacity = '1'
                        previewIframe.style.pointerEvents = 'all'

                        popper = createPopper(hoveredElement, previewIframe, {
                            placement: 'right',
                            modifiers: [
                                {
                                    name: 'preventOverflow',
                                    options: {
                                        padding: {top: 48},
                                    },
                                },
                                {
                                    name: 'flip',
                                    options: {
                                        boundary: document.querySelector('#app'),
                                    },
                                },
                            ],
                        })
                    }
                }, 300)
            }
        }
    })
    document.addEventListener('mouseout', (e: MouseEvent) => {
        const target = e.target as HTMLElement
        const relatedTarget = e.relatedTarget as HTMLElement
        const iframe = document.getElementById('roam-toolkit-preview-iframe')
        if (
            (hoveredElement === target && relatedTarget !== iframe) ||
            (target === iframe && relatedTarget !== hoveredElement)
        ) {
            hoveredElement = null
            clearTimeout(popupTimeout as ReturnType<typeof setTimeout>)
            popupTimeout = null
            if (iframe) {
                iframe.style.pointerEvents = 'none'
                iframe.style.opacity = '0'
                iframe.style.height = '0'
                iframe.style.width = '0'
            }
            if (popper) {
                popper.destroy()
                popper = null
            }
        }
    })
}

const removeLivePreview = () => {
    const iframe = document.getElementById('roam-toolkit-preview-iframe')
    if (iframe) {
        document.body.removeChild(iframe)
    }
}
