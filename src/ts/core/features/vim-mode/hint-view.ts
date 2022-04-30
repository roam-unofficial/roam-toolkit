import {injectStyle} from 'src/core/common/css'
import {Settings} from 'src/core/settings'
import {Selectors} from 'src/core/roam/selectors'

export const HINT_IDS = [0, 1, 2, 3, 4, 5, 6]
export const DEFAULT_HINT_KEYS = ['q', 'w', 'e', 'r', 't', 'f', 'b']

const hintKey = async (n: number) =>
    Settings.get('block_navigation_mode', `blockNavigationMode_Click Hint ${n}`, DEFAULT_HINT_KEYS[n])

const HINT_CSS_CLASS = 'roam-toolkit--hint'
const hintCssClass = (n: number) => HINT_CSS_CLASS + n
const HINT_CSS_CLASSES = HINT_IDS.map(hintCssClass)

const hintCss = async (n: number) => {
    const key = await hintKey(n)
    return `
        .${hintCssClass(n)}::after {
            content: "[${key}]";
        }
    `
}

Promise.all(HINT_IDS.map(hintCss)).then(cssClasses => {
    injectStyle(
        cssClasses.join('\n') +
            `
        .${HINT_CSS_CLASS}::after {
            position: relative;
            top: 5px;
            display: inline-block;
            width: 18px;
            margin-right: -18px;
            height: 18px;
            font-size: 10px;
            font-style: italic;
            font-weight: bold;
            color: darkorchid;
            text-shadow: 1px 1px 0px orange;
            opacity: 0.7;
        }
        .check-container.${HINT_CSS_CLASS}::after {
            position: absolute;
            top: 3px;
        }
        `,
        'roam-toolkit-block-mode--hint'
    )
})

export const updateVimHints = (block: HTMLElement) => {
    // button is for reference counts
    const clickableSelectors = [
        Selectors.link,
        Selectors.externalLink,
        Selectors.embedPageTitle,
        Selectors.checkbox,
        Selectors.button,
        Selectors.blockReference,
        Selectors.hiddenSection,
    ]
    const links = block.querySelectorAll(clickableSelectors.join(', '))
    links.forEach((link, i) => {
        link.classList.add(HINT_CSS_CLASS, hintCssClass(i))
    })
}

export const clearVimHints = () => {
    const priorHints = document.querySelectorAll(`.${HINT_CSS_CLASS}`)
    priorHints.forEach(selection => selection.classList.remove(HINT_CSS_CLASS, ...HINT_CSS_CLASSES))
}

export const getHint = (n: number): HTMLElement | null => document.querySelector(`.${hintCssClass(n)}`)
