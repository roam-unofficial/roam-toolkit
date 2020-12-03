import {Feature, Settings} from '../settings'
import {Navigation} from '../roam/navigation'
import {createPopper, Instance} from '@popperjs/core'
import {delay} from '../common/async'
import {Selectors} from '../roam/selectors'
import {Browser} from '../common/browser'

export const config: Feature = {
    id: 'live_preview',
    name: 'Live Preview',
    warning: 'Experimental feature; Large databases might see performance issues.',
    enabledByDefault: false,
}
const checkSettingsAndSetupIframeToggle = () => {
    Settings.isActive('live_preview', config.enabledByDefault).then(active => {
        toggleIframe(active)
    })
}
checkSettingsAndSetupIframeToggle()

Browser.addMessageListener(async message => {
    if (message === 'settings-updated') {
        checkSettingsAndSetupIframeToggle()
    }
})

let iframeInstance: PreviewIframe | null = null

const toggleIframe = (active: boolean) => {
    if (active) {
        if (!iframeInstance) {
            iframeInstance = new PreviewIframe()
            iframeInstance.activate()
        }
    } else {
        if (iframeInstance) {
            iframeInstance.destroy()
            iframeInstance = null
        }
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
        this.destroyMouseListeners()
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

    private initPreviewIframe() {
        const url = Navigation.getDailyNotesUrl()
        this.setupHiddenIframe(url)
        this.addIframeToBody()
        this.scrollToTopOnPageLoad()
        this.attachMouseListeners()
    }

    private addIframeToBody() {
        document.body.appendChild(this.iframe)
    }

    private attachMouseListeners() {
        document.addEventListener('mouseover', this.mouseOverListener)
        document.addEventListener('mouseout', this.mouseOutListener)
    }

    private destroyMouseListeners() {
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
        this.scrollIframeToTopOnMouseOut()
        this.iframe.style.pointerEvents = 'none'
        this.iframe.style.opacity = '0'
        this.iframe.style.height = '0'
        this.iframe.style.width = '0'
    }

    private showPreview() {
        this.iframe.style.opacity = '1'
        this.iframe.style.pointerEvents = 'all'
    }

    private async prepIframeForDisplay(url: string) {
        if (!(await this.stillHoveringOverSameObjectAfterDelay())) return

        // this pre-loads the iframe, (which is shown after a delay)
        this.iframe.src = url
        this.iframe.style.height = '500px'
        this.iframe.style.width = '500px'
        this.iframe.style.pointerEvents = 'none'
    }

    private async stillHoveringOverSameObjectAfterDelay(millis: number = 100) {
        const hoverTargetAtCallTime = this.hoveredElement
        await delay(millis)

        return hoverTargetAtCallTime === this.hoveredElement
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
        ${Selectors.mainBody} {
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
     * Sets the iframe's scrollTop to 0,
     * so the next popup is in the correct scroll position
     */
    private scrollIframeToTopOnMouseOut() {
        if (this.iframe.contentDocument) {
            const scrollContainer = this.iframe.contentDocument.querySelector('.roam-center > div')
            this.scrollToTopForElement(scrollContainer)
        }
    }

    /**
     * HACK: to reset scroll after adding iframe to DOM.
     * Since the `overflow` is not set to `hidden` for the HTML tag,
     * on adding iframe, the body scrolls down,
     * causing the loader to not be centerd.
     * This fixes it by setting the scrollTop to 0
     */
    private scrollToTopOnPageLoad = () => {
        this.scrollToTopForElement(document.querySelector('html'))
    }

    private scrollToTopForElement = (element: Element | null) => {
        if (element) {
            element.scrollTop = 0
        }
    }
}
