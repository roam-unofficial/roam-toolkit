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

export const toggleCssClass = (element: Element, className: string, toggleOn: boolean) => {
    if (toggleOn) {
        element.classList.add(className)
    } else {
        element.classList.remove(className)
    }
}

export const toggleCssClassForAll = (selector: string, className: string, toggleOn: boolean) => {
    document.querySelectorAll(selector).forEach(element => {
        toggleCssClass(element, className, toggleOn)
    })
}
