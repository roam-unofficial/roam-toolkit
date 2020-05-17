export const createDomAnchor = (anchorId: string) => {
    const anchor = document.createElement('div')
    anchor.id = anchorId
    document.body.insertBefore(anchor, document.body.childNodes[0])
}

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