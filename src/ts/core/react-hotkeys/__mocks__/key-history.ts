/**
 * Jest complains about importing from 'react-hotkeys/es/lib/KeyEventManager'
 * Provide a fake implementation for tests
 */
import {Handler} from '../key-handler'

export const clearKeyPressesAfterFinishingKeySequence = (handler: Handler): Handler => handler