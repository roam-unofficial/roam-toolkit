import {Feature, Shortcut} from '../utils/settings'
import {Roam} from '../roam/roam'
import {getHighlightedBlocks} from '../utils/dom'
import {forEachAsync, delay} from '../utils/async'

export const config: Feature = {
    id: 'editing',
    name: 'Batch Editing',
    settings: [
        {
            type: 'shortcut',
            id: 'batchLinking',
            label: 'Apply [[link]] brackets to a word in every highlighted block\n\n(whole-words only)',
            initValue: 'Meta+shift+l',
            onPress: () => batchLinking(),
        } as Shortcut,
        {
            type: 'shortcut',
            id: 'batchAppendTag',
            label: 'Append #yourtag to every highlighted block',
            initValue: 'Ctrl+shift+t',
            onPress: () => appendTag(),
        } as Shortcut,
        {
            type: 'shortcut',
            id: 'removeLastEndTag',
            label: 'Remove the last #tag at the end of each highlighted block',
            initValue: 'Ctrl+shift+meta+t',
            onPress: () => removeLastTag(),
        } as Shortcut,
        {
            type: 'shortcut',
            id: 'regexSearchAndReplace',
            label:
                'Roll your own complex search and replace by providing a search string or regex plus a replacement string',
            initValue: 'Ctrl+shift+f',
            onPress: () => regexSearchAndReplace(),
        } as Shortcut,
    ],
}

const batchLinking = () => {
    const text = prompt('What (whole) word do you want to convert into bracketed links?')
    if (!text || text === '') return

    const warning = `Replace all visible occurrences of "${text}" in the highlighted blocks with "[[${text}]]"?
        
        🛑 This operation CANNOT BE UNDONE!`

    if (!confirm(warning)) return

    withHighlightedBlocks(originalString => {
        // Replace whole words only, ignoring already-[[linked]] matches.
        // http://www.rexegg.com/regex-best-trick.html#javascriptcode
        const regex = new RegExp(`\\[\\[${text}]]|(\\b${text}\\b)`, 'g')
        return originalString.replace(regex, function (m, group1) {
            if (!group1) return m
            else return `[[${m}]]`
        })
    })
}

const appendTag = () => {
    const text = prompt('What "string" do you want to append as "#string"?')
    if (!text || text === '') return

    withHighlightedBlocks(originalString => {
        if (text.includes(' ')) {
            return `${originalString} #[[${text}]]`
        } else {
            return `${originalString} #${text}`
        }
    })
}

const removeLastTag = () => {
    if (!confirm('Remove the end tag from every highlighted block?'))
        return

    withHighlightedBlocks(originalString => {
        const regex = new RegExp(`(.*) (#.*)`)
        return originalString.replace(regex, '$1')
    })
}

const regexSearchAndReplace = () => {
    const userRegex = prompt('Enter a search string or regex to find in each selected block')
    if (!userRegex || userRegex === '') return

    const replacement = prompt('Enter a replacement string (can include $&, $1, and other group matchers)')
    if (!replacement || replacement === '') return

    withHighlightedBlocks(originalString => {
        const regex = new RegExp(userRegex, 'g')
        return originalString.replace(regex, replacement)
    })
}

const withHighlightedBlocks = (mod: { (orig: string): string }) => {
    const highlighted = getHighlightedBlocks()

    const contentBlocks = Array.from(highlighted.contentBlocks)
    forEachAsync(contentBlocks, async element => {
        await Roam.replace(element, mod)
    })

    // Preserve selection
    const parentBlocks = Array.from(highlighted.parentBlocks)
    forEachAsync(parentBlocks, async element => {
        // Wait for dom to settle before re-applying highlight style
        await delay(100)
        await element.classList.add('block-highlight-blue')
    })
}

