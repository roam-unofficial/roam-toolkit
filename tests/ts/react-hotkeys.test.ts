import {KeyChord, KeyChordString} from 'src/core/react-hotkeys/key-chord'
import {KeySequence, KeySequenceString} from 'src/core/react-hotkeys/key-sequence'
import {blockConcurrentHandlingOfSimulatedKeys, Handler} from 'src/core/react-hotkeys/key-handler'
import {delay} from 'src/core/common/async'

jest.mock('src/core/react-hotkeys/key-history')

describe('Normalizing key chords to have a consistent format', () => {
    const normalizeChord = (keyChordString: KeyChordString) =>
        KeyChord.fromString(keyChordString).toString()

    it('Lower cases the letter and adds shift', () => {
        expect(normalizeChord('sHiFt+g')).toEqual('shift+g')
    })
})

describe('Not recursively triggering our own hotkeys when simulating keys for native actions', () => {
    const adaptHandler = (keySequenceString: KeySequenceString, handler: Handler): Handler =>
        blockConcurrentHandlingOfSimulatedKeys(KeySequence.fromString(keySequenceString), handler)

    it('lets handlers trigger when no other handler is running', () => {
        const ourCustomEscapeHotkey = jest.fn()
        const escapeHandler = adaptHandler('Escape', ourCustomEscapeHotkey)

        escapeHandler({} as KeyboardEvent)

        expect(ourCustomEscapeHotkey).toHaveBeenCalled()
    })

    it("should not trigger our own Escape hotkey when simulating 'Escape' from a different hotkey", async () => {
        const ourCustomEscapeHotkey = jest.fn()
        const escapeHandler = adaptHandler('Escape', ourCustomEscapeHotkey)
        const anotherHandler = adaptHandler('D', async () => {
            await delay(1)
            // Pretend that our handler simulates "Escape"
            escapeHandler({} as KeyboardEvent)
        })

        await anotherHandler({} as KeyboardEvent)

        expect(ourCustomEscapeHotkey).not.toHaveBeenCalled()
    })

    it("allows keys that aren't simulated to run while other hotkeys are running",async () => {
        const ourCustomHotkey = jest.fn()
        const handler = adaptHandler('J', async () => {
            await delay(1)
            // Pretend that our handler simulates "Escape"
            ourCustomHotkey({} as KeyboardEvent)
        })

        // Don't block hotkeys from executing by default, so repeated keys feel responsive
        handler({} as KeyboardEvent)
        await handler({} as KeyboardEvent)

        expect(ourCustomHotkey).toHaveBeenCalledTimes(2)
    })
})
