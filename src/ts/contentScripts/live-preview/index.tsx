import {Feature, Settings} from '../../utils/settings'
import {Navigation} from '../../roam/navigation'
import {browser} from 'webextension-polyfill-ts'
import {createPopper, Instance} from '@popperjs/core'

export const config: Feature = {
    id: 'live_preview',
    name: 'Live Preview',
    warning: 'Experimental feature; Large databases might see performance issues.',
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

    const url = Navigation.getPageUrl('search')
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
        ;(event.target as HTMLIFrameElement).contentDocument?.body.appendChild(styleNode)
    }
    document.body.appendChild(iframe)
    const htmlElement = document.querySelector('html')
    if (htmlElement) {
        // to reset scroll after adding iframe
        htmlElement.scrollTop = 0
    }
    return iframe
}
const enableLivePreview = () => {
    let hoveredElement: HTMLElement | null
    let popupTimeout: ReturnType<typeof setTimeout> | null
    let popper: Instance | null = null
    const previewIframe = createPreviewIframe()
    document.addEventListener('mouseover', (e: Event) => {
        const target = e.target as HTMLElement
        const isPageRef = target.classList.contains('rm-page-ref')
        const isPageRefTag = target.classList.contains('rm-page-ref-tag')
        // remove '#' for page tags
        const text = isPageRefTag ? target.innerText.slice(1) : target.innerText
        if (isPageRef) {
            hoveredElement = target
            const url = Navigation.getPageUrlByName(text)
            const isAdded = (pageUrl: string) => !!document.querySelector(`[src="${pageUrl}"]`)
            const isVisible = (pageUrl: string) =>
                (document.querySelector(`[src="${pageUrl}"]`) as HTMLElement)?.style.opacity === '1'
            if ((!isAdded(url) || !isVisible(url)) && previewIframe) {
                previewIframe.src = url
                previewIframe.style.height = '500px'
                previewIframe.style.width = '500px'
                previewIframe.style.pointerEvents = 'none'
            }
            if (!popupTimeout) {
                popupTimeout = window.setTimeout(() => {
                    if (previewIframe) {
                        previewIframe.style.opacity = '1'
                        previewIframe.style.pointerEvents = 'all'

                        popper = createPopper(target, previewIframe, {
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
        const iframe = document.getElementById('roam-toolkit-preview-iframe') as HTMLIFrameElement
        if (
            (hoveredElement === target && relatedTarget !== iframe) ||
            (target === iframe && relatedTarget !== hoveredElement) ||
            !document.body.contains(hoveredElement)
        ) {
            hoveredElement = null
            clearTimeout(popupTimeout as ReturnType<typeof setTimeout>)
            popupTimeout = null
            if (iframe) {
                if (iframe.contentDocument) {
                    // scroll to top when removed
                    const scrollContainer = iframe.contentDocument.querySelector('.roam-center > div')
                    if (scrollContainer) {
                        scrollContainer.scrollTop = 0
                    }
                }
                iframe.style.pointerEvents = 'none'
                iframe.style.opacity = '0'
                iframe.style.height = '0'
                iframe.style.width = '0'
            }
            if (popper) {
                popper.destroy()
                popper = null
            }
        } else {
            console.log('out', target, event)
        }
    })
}

const removeLivePreview = () => {
    const iframe = document.getElementById('roam-toolkit-preview-iframe')
    if (iframe) {
        document.body.removeChild(iframe)
    }
}
