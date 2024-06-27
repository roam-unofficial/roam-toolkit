import {nmap} from 'src/core/features/vim-mode/vim'
import {RoamBlock} from 'src/core/features/vim-mode/roam/roam-block'
import {SRSSignal, SRSSignals} from 'src/core/srs/scheduler'
import {AnkiScheduler} from 'src/core/srs/AnkiScheduler'
import {SM2Node} from 'src/core/srs/SM2Node'
import {RoamDb} from 'src/core/roam/roam-db'
import {getBlockUid} from 'src/core/roam/block'
import {RoamDate} from 'src/core/roam/date'
import {createModifier, modifyDate} from 'src/core/features/inc-dec-value'

const getBlockText = (uid: string): string => {
    const block = RoamDb.getBlockByUid(uid)
    return block[':block/string']
}

function selectedUid() {
    const htmlId = RoamBlock.selected().id
    return getBlockUid(htmlId)
}

const rescheduleSelectedNote = (signal: SRSSignal) => {
    console.log('rescheduleSelectedNote', signal)
    const uid = selectedUid()
    const originalText = getBlockText(uid)
    RoamDb.updateBlockText(uid, new AnkiScheduler().schedule(new SM2Node(originalText), signal).text)
}

const markDone = () => {
    const uid = selectedUid()
    const originalText = getBlockText(uid)
    RoamDb.updateBlockText(uid, '{{[[DONE]]}} ' + originalText)
}

const modifyBlockDate = (modifier: (input: number) => number) => {
    const uid = selectedUid()
    const originalText = getBlockText(uid)

    const datesInContent = originalText.match(RoamDate.regex)
    if (!datesInContent || datesInContent.length !== 1) return

    RoamDb.updateBlockText(
        uid,
        originalText.replace(
            datesInContent[0],
            RoamDate.formatPage(modifyDate(RoamDate.parseFromReference(datesInContent[0]), modifier))
        )
    )
}

export const EditCommands = [
    nmap('cmd+enter', 'Mark done', markDone),
    ...SRSSignals.map(it =>
        nmap(`ctrl+shift+${it}`, `Reschedule Current Note (${SRSSignal[it]})`, () => rescheduleSelectedNote(it))
    ),
    nmap('ctrl+alt+up', 'Increment Date', () => modifyBlockDate(createModifier(1))),
    nmap('ctrl+alt+down', 'Decrement Date', () => modifyBlockDate(createModifier(-1))),
]
