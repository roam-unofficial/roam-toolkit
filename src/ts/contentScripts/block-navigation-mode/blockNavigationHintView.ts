import {Selectors} from '../../roam/roam-selectors'
import {injectStyle} from '../../scripts/dom'
import {getBlockNavigationModeSetting} from './blockNavigationSetting'

export const HINTS = [0, 1, 2, 3, 4, 5]

const hintKey = (n: number) => getBlockNavigationModeSetting(`hint${n}`)

const HINT_CSS_CLASS = 'roam-toolkit--hint'
const hintCssClass = (n: number) => HINT_CSS_CLASS + n
const HINT_CSS_CLASSES = HINTS.map(hintCssClass)

const hintCss = async (n: number) => {
    const key = await hintKey(n)
    return `
        .${HINT_CSS_CLASS}${n}::after {
            content: "[${key}]";
        }
    `
}

// roam-toolkit--hint1

Promise.all(HINTS.map(hintCss)).then(cssClasses => {
    injectStyle(
        cssClasses.join('\n') + `
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

export const updateBlockNavigationHintView = (block: HTMLElement) => {
    // 'input' is for checkboxes
    // 'a' is for external links
    // button is for reference counts
    const links = block.querySelectorAll(`${Selectors.link}, a, .check-container, ${Selectors.button}`)
    clearHints()
    links.forEach((link, i) => {
        link.classList.add(HINT_CSS_CLASS, hintCssClass(i))
    })
}

const clearHints = () => {
    const priorHints = document.querySelectorAll(`.${HINT_CSS_CLASS}, a`)
    if (priorHints.length > 0) {
        priorHints.forEach(selection =>
            selection.classList.remove(HINT_CSS_CLASS, ...HINT_CSS_CLASSES)
        )
    }
}

export const getHint = (n: number): HTMLElement | null =>
    document.querySelector(`.${hintCssClass(n)}`)
