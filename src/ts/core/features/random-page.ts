import {random} from 'lodash'
import {Feature, Settings, Shortcut} from '../settings'
import {RoamDb} from 'src/core/roam/roam-db'
import {Roam} from 'src/core/roam/roam'
import {Keyboard} from 'src/core/common/keyboard'
import {KEY_TO_CODE} from 'src/core/common/keycodes'

const DEFAULT_EXCLUDE_PATTERN = ', 20dd$|\\[\\[interval|\\[\\[factor'

const getRandomPageName = async () => {
    const excludePattern = await Settings.get('random-page', 'random-page-exclude', DEFAULT_EXCLUDE_PATTERN)
    const excludeRegex = new RegExp(excludePattern)
    const pageNames = RoamDb.getAllPages()
        .filter(({name}) => !name.match(excludeRegex))
        .map(({name}) => name)
    return pageNames[random(pageNames.length - 1)]
}

const insertRandomLink = async (): Promise<string> => {
    const pageName = await getRandomPageName()
    Roam.appendText(`[[${pageName}]]\n`)
    return pageName
}

const openRandomPage = async () => {
    const insertedPage = await insertRandomLink()
    await Roam.moveCursorToSearchTerm(insertedPage)
    await followLinkUnderCursor()
}

const followLinkUnderCursor = () => Keyboard.simulateKey(KEY_TO_CODE.o, 0, {key: 'o', shiftKey: true, ctrlKey: true})

export const config: Feature = {
    id: 'random-page',
    name: 'Random Page',
    enabledByDefault: true,
    settings: [
        {
            type: 'shortcut',
            id: 'insert-random-page',
            label: 'Insert Random Page',
            initValue: 'ctrl+shift+/',
            placeholder: '',
            onPress: insertRandomLink,
        } as Shortcut,
        {
            type: 'shortcut',
            id: 'open-random-page-in-sidebar',
            label: 'Open Random Page in Sidebar',
            initValue: 'ctrl+command+shift+/',
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
