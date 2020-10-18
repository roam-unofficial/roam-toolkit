export const injectStyle = (css: string, tagId: string) => {
    if (document.getElementById(tagId)) {
        document.getElementById(tagId)!.innerHTML = css
        return
    }

    const style = document.createElement('style')
    style.id = tagId
    style.innerHTML = css
    document.getElementsByTagName('head')[0].appendChild(style)
}

export const toggleCssClass = (element: HTMLElement, className: string, toggleOn: boolean) => {
    if (toggleOn) {
        element.classList.add(className)
    } else {
        element.classList.remove(className)
    }
}
