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
const checkSettingsAndSetupIframeToggle = () => {
    Settings.isActive('live_preview').then(active => {
        toggleIframe(active)
    })
}
checkSettingsAndSetupIframeToggle()

browser.runtime.onMessage.addListener(async message => {
    if (message === 'settings-updated') {
        checkSettingsAndSetupIframeToggle()
    }
})

let iframeInstance: PreviewIframe | null = null

const toggleIframe = (active: boolean) => {
    if (active && !iframeInstance) {
        iframeInstance = new PreviewIframe()
        iframeInstance.activate()
    } else if (iframeInstance) {
        iframeInstance.destroy()
        iframeInstance = null
    }
}

class PreviewIframe {
    iframeId = 'roam-toolkit-iframe-preview'
    iframe: HTMLIFrameElement
    popupTimeout: ReturnType<typeof setTimeout> | null = null
    hoveredElement: HTMLElement | null = null
    popper: Instance | null = null
    popupTimeoutDuration = 300
    constructor() {
        this.iframe = document.createElement('iframe')
    }
    activate() {
        this.initPreviewIframe()
    }
    destroy() {
        this.removeIframe()
        this.clearPopupTimeout()
        this.destroyPopper()
        this.destoryMouseListeners()
    }
    private clearPopupTimeout() {
        if (this.popupTimeout) {
            clearTimeout(this.popupTimeout)
            this.popupTimeout = null
        }
    }

    private removeIframe() {
        const isCurrentIframePresent = document.body.contains(this.iframe)
        if (!isCurrentIframePresent) {
            return
        }

        document.body.removeChild(this.iframe)
    }
    /**
     * HACK: needed because the instance is created thrice onload/toggle.
     * Remove this check to see the issue
     */
    private getExisitingIframe(): HTMLIFrameElement | null {
        return document.getElementById(this.iframeId) ? this.iframe : null
    }

    private initPreviewIframe() {
        const url = Navigation.getPageUrl()
        const existingIframe = this.getExisitingIframe()
        if (existingIframe) {
            return
        }
        this.setupHiddenIframe(url)
        this.addIframeToBody()
        this.scrollToTopHack()
        this.attachMouseListeners()
    }

    private addIframeToBody() {
        document.body.appendChild(this.iframe)
    }

    private attachMouseListeners() {
        document.addEventListener('mouseover', this.mouseOverListener)
        document.addEventListener('mouseout', this.mouseOutListener)
    }
    private destoryMouseListeners() {
        document.removeEventListener('mouseover', this.mouseOverListener)
        document.removeEventListener('mouseout', this.mouseOutListener)
    }

    private mouseOverListener = (e: Event) => {
        const target = e.target as HTMLElement
        const isPageRef = this.isTargetPageRef(target)
        if (isPageRef) {
            const text = this.getTargetInnerText(target)
            this.hoveredElement = target
            const url = Navigation.getPageUrlByName(text)
            if (url) {
                this.prepIframeForDisplay(url)
                this.setTimerForPopup(target)
            }
        }
    }

    private mouseOutListener = (e: MouseEvent) => {
        const nextTarget = e.relatedTarget as HTMLElement
        if (this.shouldRemoveOnMouseOut(nextTarget)) {
            this.hidePreview()
        }
    }

    private hidePreview() {
        this.hoveredElement = null
        this.clearPopupTimeout()
        this.resetIframeForNextHover()
        this.destroyPopper()
    }

    private shouldRemoveOnMouseOut(nextTarget: HTMLElement) {
        const isNotHoveringOverTarget = nextTarget !== this.hoveredElement
        const isNotHoveringOverIframe = nextTarget !== this.iframe
        return isNotHoveringOverIframe && isNotHoveringOverTarget
    }

    private setTimerForPopup(target: HTMLElement) {
        if (!this.popupTimeout) {
            this.popupTimeout = window.setTimeout(() => {
                this.showPreview()
                this.makePopper(target)
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

    private resetIframeForNextHover() {
        this.scrollToTopOnMouseOut()
        this.iframe.style.pointerEvents = 'none'
        this.iframe.style.opacity = '0'
        this.iframe.style.height = '0'
        this.iframe.style.width = '0'
    }

    private scrollToTopOnMouseOut() {
        if (this.iframe.contentDocument) {
            // scroll to top when removed, so the next popup is not scrolled
            const scrollContainer = this.iframe.contentDocument.querySelector('.roam-center > div')
            if (scrollContainer) {
                scrollContainer.scrollTop = 0
            }
        }
    }

    private showPreview() {
        this.iframe.style.opacity = '1'
        this.iframe.style.pointerEvents = 'all'
    }
    private prepIframeForDisplay(url: string) {
        // this pre-loads the iframe, (which is shown after a delay)
        this.iframe.src = url
        this.iframe.style.height = '500px'
        this.iframe.style.width = '500px'
        this.iframe.style.pointerEvents = 'none'
    }

    private makePopper(target: HTMLElement) {
        this.popper = createPopper(target, this.iframe, {
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

    private setupHiddenIframe = (url: string) => {
        this.iframe.src = url
        this.iframe.style.position = 'absolute'
        this.iframe.style.left = '0'
        this.iframe.style.top = '0'
        this.iframe.style.opacity = '0'
        this.iframe.style.pointerEvents = 'none'
        this.iframe.style.height = '0'
        this.iframe.style.width = '0'
        this.iframe.style.border = '0'
        this.iframe.style.boxShadow = '0 0 4px 5px rgba(0, 0, 0, 0.2)'
        this.iframe.style.borderRadius = '4px'
        this.iframe.id = this.iframeId
        this.appendStylesToIFrameOnLoad()
    }

    private appendStylesToIFrameOnLoad = () => {
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
        this.iframe.onload = (event: Event) => {
            ;(event.target as HTMLIFrameElement).contentDocument?.body.appendChild(styleNode)
        }
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
