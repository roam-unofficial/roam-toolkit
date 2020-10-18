export type DisconnectFn = () => void

export const listenToEvent = (event: string, handler: (event: Event) => void): DisconnectFn => {
    window.addEventListener(event, handler, true)
    return () => window.removeEventListener(event, handler, true)
}
