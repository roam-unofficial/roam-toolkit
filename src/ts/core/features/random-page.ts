import {Feature, Settings, Shortcut} from '../settings'
import {RoamDb} from 'src/core/roam/roam-db'
import {Roam} from 'src/core/roam/roam'

const DEFAULT_EXCLUDE_PATTERN = ', 2019|, 2020|\\[\\[interval|\\[\\[factor'

const insertRandomLink = async (): Promise<string> => {
    console.log('INSERT')
    const excludePattern = await Settings.get('random-page', 'random-page-exclude', DEFAULT_EXCLUDE_PATTERN)
    const excludeRegex = new RegExp(excludePattern)
    const pageNames = RoamDb.getAllPages()
        .filter(({name}) => !name.match(excludeRegex))
        .map(({name}) => name)
    const pageName = pageNames[Math.floor(pageNames.length * Math.random())]
    Roam.appendText(`[[${pageName}]]\n`)
    return pageName
}

const openRandomPage = async () => {
    console.log('OPEN')
    const insertedPage = await insertRandomLink()
    await Roam.moveCursorToSearchTerm(insertedPage)
    await Roam.followLinkUnderCursor()
}

export const config: Feature = {
    id: 'random-page',
    name: 'Random Page',
    enabledByDefault: true,
    settings: [
        {
            type: 'shortcut',
            id: 'insert-random-page',
            label: 'Insert Random Page',
            initValue: 'ctrl+shift+?',
            placeholder: '',
            onPress: insertRandomLink,
        } as Shortcut,
        {
            type: 'shortcut',
            id: 'open-random-page-in-sidebar',
            label: 'Open Random Page in Sidebar',
            initValue: 'ctrl+command+shift+?',
            placeholder: '',
            onPress: openRandomPage,
        } as Shortcut,
        {
            type: 'string',
            id: 'random-page-exclude',
            label: 'Ignore Pages Regex',
            initValue: DEFAULT_EXCLUDE_PATTERN,
        },
    ],
}
