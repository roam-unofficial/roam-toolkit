import {Feature, Settings} from '../../utils/settings'
import {Navigation} from '../../roam/navigation'
import {browser} from 'webextension-polyfill-ts'
import {createPopper, Instance} from '@popperjs/core'

export const config: Feature = {
    id: 'live_preview',
    name: 'Live Preview',
    warning: 'Experimental feature; Large databases might see performance issues.',
    enabledByDefault: false,
}
const checkSettingsAndSetupIframe = () => {
    Settings.isActive('live_preview').then(active => {
        setupIframe(active)
    })
}
checkSettingsAndSetupIframe()

browser.runtime.onMessage.addListener(async message => {
    if (message === 'settings-updated') {
        checkSettingsAndSetupIframe()
    }
})

let iframeInstance: PreviewIframe | null = null

const setupIframe = (active: boolean) => {
    if (!iframeInstance) {
        iframeInstance = new PreviewIframe()
    }
    if (active) {
        iframeInstance.activate()
    } else {
        iframeInstance.destroy()
        iframeInstance = null
    }
}

class PreviewIframe {
    iframeId = 'roam-toolkit-iframe-preview'
    iframe: HTMLIFrameElement | null = null
    popupTimeout: ReturnType<typeof setTimeout> | null = null
    hoveredElement: HTMLElement | null = null
    popper: Instance | null = null
    popupTimeoutDuration = 300
    activate() {
        this.iframe = this.initPreviewIframe()
    }
    destroy() {
        this.removeIframe()
        this.clearPopupTimeout()
    }
    private clearPopupTimeout() {
        if (this.popupTimeout) {
            clearTimeout(this.popupTimeout)
            this.popupTimeout = null
        }
    }

    private removeIframe() {
        if (this.iframe && document.body.contains(this.iframe)) {
            document.body.removeChild(this.iframe)
            this.iframe = null
        }
    }

    private getIFrameByUrl(url: string): HTMLIFrameElement | null {
        return document.querySelector(`iframe[src="${url}"]`)
    }
    private getIsIFrameVisibleByUrl(url: string): boolean {
        return this.getIFrameByUrl(url)?.style.opacity === '1'
    }

    private initPreviewIframe() {
        let iframe = document.createElement('iframe')
        const url = Navigation.getPageUrl('search')
        const existingIframe = this.getIFrameByUrl(url)
        if (existingIframe) {
            return existingIframe
        }
        iframe = this.setupHiddenIframe(iframe, url)
        iframe = this.appendStylesToIFrameOnLoad(iframe)
        // add iframe to dom
        document.body.appendChild(iframe)
        this.scrollToTopHack()
        this.attachMouseListeners(iframe)
        return iframe
    }

    private attachMouseListeners(iframe: HTMLIFrameElement) {
        this.attachMouseOverListener(iframe)
        this.attachMouseOutListener(iframe)
    }

    private attachMouseOverListener(iframe: HTMLIFrameElement) {
        document.addEventListener('mouseover', (e: Event) => {
            const target = e.target as HTMLElement
            const isPageRef = this.isTargetPageRef(target)
            if (isPageRef) {
                const text = this.getTargetInnerText(target)
                this.hoveredElement = target
                const url = Navigation.getPageUrlByName(text)
                if ((!this.getIFrameByUrl(url) || !this.getIsIFrameVisibleByUrl(url)) && iframe) {
                    iframe = this.prepIframeForDisplay(iframe, url)
                }
                this.setTimerForPopup(iframe, target)
            }
        })
    }

    private attachMouseOutListener(iframe: HTMLIFrameElement) {
        document.addEventListener('mouseout', (e: MouseEvent) => {
            const target = e.target as HTMLElement
            const relatedTarget = e.relatedTarget as HTMLElement
            if (
                this.isHoveredOutFromTarget(target, relatedTarget, iframe) ||
                this.isHoveredOutFromIframe(target, relatedTarget, iframe) ||
                !this.isHoveredElementPresentInBody()
            ) {
                this.hoveredElement = null
                this.clearPopupTimeout()
                this.resetIframeForNextHover(iframe)
                this.destroyPopper()
            }
        })
    }

    private setTimerForPopup(iframe: HTMLIFrameElement, target: HTMLElement) {
        if (!this.popupTimeout) {
            this.popupTimeout = window.setTimeout(() => {
                if (iframe) {
                    iframe = this.showIframe(iframe)
                    this.makePopper(target, iframe)
                }
            }, this.popupTimeoutDuration)
        }
    }

    private getTargetInnerText(target: HTMLElement) {
        // remove '#' for page tags
        const isPageRefTag = this.isTargetPageRefTag(target)
        return isPageRefTag ? target.innerText.slice(1) : target.innerText
    }

    private isTargetPageRefTag(target: HTMLElement) {
        return target.classList.contains('rm-page-ref-tag')
    }

    private isTargetPageRef(target: HTMLElement) {
        return target.classList.contains('rm-page-ref')
    }

    private destroyPopper() {
        if (this.popper) {
            this.popper.destroy()
            this.popper = null
        }
    }

    private resetIframeForNextHover(iframe: HTMLIFrameElement) {
        if (iframe) {
            if (iframe.contentDocument) {
                // scroll to top when removed, so the next popup is not scrolled
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
    }

    private isHoveredElementPresentInBody(): boolean {
        return document.body.contains(this.hoveredElement)
    }

    private isHoveredOutFromIframe(target: HTMLElement, relatedTarget: HTMLElement, iframe: HTMLIFrameElement) {
        const isIframeHovered = target === iframe
        const isNextTargetHovered = relatedTarget === this.hoveredElement
        // if the iframe is hovered, & next target is not the hovered element
        return isIframeHovered && !isNextTargetHovered
    }
    private isHoveredOutFromTarget(target: HTMLElement, relatedTarget: HTMLElement, iframe: HTMLIFrameElement) {
        const isTargetHovered = this.hoveredElement === target
        const isNextTargetIframe = relatedTarget === iframe
        // if the target is hovered, & next target is not iframe
        return isTargetHovered && !isNextTargetIframe
    }

    private showIframe(iframe: HTMLIFrameElement) {
        iframe.style.opacity = '1'
        iframe.style.pointerEvents = 'all'
        return iframe
    }
    private prepIframeForDisplay(iframe: HTMLIFrameElement, url: string) {
        // this pre-loads the iframe, (which is shown after a 300ms delay)
        iframe.src = url
        iframe.style.height = '500px'
        iframe.style.width = '500px'
        iframe.style.pointerEvents = 'none'
        return iframe
    }

    private makePopper(target: HTMLElement, iframe: HTMLIFrameElement) {
        this.popper = createPopper(target, iframe, {
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

    private setupHiddenIframe = (iframe: HTMLIFrameElement, url: string) => {
        iframe.src = url
        iframe.style.position = 'absolute'
        iframe.style.left = '0'
        iframe.style.top = '0'
        iframe.style.opacity = '0'
        iframe.style.pointerEvents = 'none'
        iframe.style.height = '0'
        iframe.style.width = '0'
        iframe.style.border = '0'

        // styles
        iframe.style.boxShadow = '0 0 4px 5px rgba(0, 0, 0, 0.2)'
        iframe.style.borderRadius = '4px'
        iframe.id = this.iframeId
        return iframe
    }

    private appendStylesToIFrameOnLoad = (iframe: HTMLIFrameElement) => {
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
        return iframe
    }
    /**
     * HACK: to reset scroll after adding iframe to DOM.
     * Since the `overflow` is not set to `hidden` for the HTML tag,
     * on adding iframe, the body scrolls down,
     * causing the loader to not be centerd.
     * This fixes it by setting the scrollTop to 0
     */
    private scrollToTopHack = () => {
        const htmlElement = document.querySelector('html')
        if (htmlElement) {
            htmlElement.scrollTop = 0
        }
    }
}
