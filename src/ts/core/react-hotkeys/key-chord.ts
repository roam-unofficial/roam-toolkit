import {Set} from 'immutable'

export type KeyChordString = string

type Modifier = 'alt' | 'shift' | 'ctrl' | 'command'

/**
 * A "KeyChord" is a single combination of one or more keys
 * For example: 'command+x' or just 'x'
 */
export class KeyChord {
    private readonly key: string
    private readonly modifiers: Set<Modifier>

    constructor(key: string, modifiers: Set<Modifier>) {
        this.key = key
        this.modifiers = modifiers
    }

    toString(): string {
        return [...this.modifiers.values(), this.key].join('+')
    }

    static fromString(keyChordString: KeyChordString): KeyChord {
        const keys = keyChordString.split('+')
        return new KeyChord(keys.pop()!, Set(keys.map(modifier => modifier.toLowerCase() as Modifier)))
    }
}
