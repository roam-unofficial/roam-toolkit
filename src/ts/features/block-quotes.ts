import {Feature, Settings} from '../utils/settings'

export const config: Feature = {
    id: 'blockquotes',
    name: 'Blockquote Support',
    settings: [{type: 'string', id: 'blockquote_prefix', initValue: '> ', label: 'Blockquote Prefix'}],
    description:
        'If you start a block with these characters, custom styles will be added to show the block as a blockquote.',
}

async function blockquotes() {
    const blocks = document.querySelectorAll('div.roam-block')
    for (const block of blocks as NodeListOf<Element>) {
        const span = block.querySelector('span')
        const blockquote_prefix = await Settings.get(config.id, 'blockquote_prefix')
        if (span !== null && span.innerText.trim().startsWith(blockquote_prefix)) {
            block.classList.add('custom-blockquote')
        } else {
            block.classList.remove('custom-blockquote')
        }
    }
    return true
}

const applyCSS = function () {
    const style_id = 'roam-toolkit-blockquote'

    const style = document.createElement('style')
    style.id = style_id
    style.innerHTML = `
	  .custom-blockquote {
		background: #f9f9f9;
		border-left: 7px solid #ccc;
		margin: 0.5em 0;
		padding: 0.5em 5px;
	  }
	`
    document.getElementsByTagName('head')[0].appendChild(style)
}

Settings.isActive(config.id).then(active => {
    if (active) {
        document.addEventListener('roam-loaded', function () {
            applyCSS()
            blockquotes()
        })
        document.addEventListener('roam-toolkit-tick', function () {
            blockquotes()
        })
    }
})
