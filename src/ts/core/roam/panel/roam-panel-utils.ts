export type PanelElement = HTMLElement
export type DomId = string
export type PanelId = string
export const PANEL_CSS_CLASS = 'roam-toolkit--panel'
export const PANEL_SELECTOR = `.${PANEL_CSS_CLASS}`

export const namespaceId = (nodeId: PanelId): DomId => `${PANEL_CSS_CLASS} ${nodeId}`
export const plainId = (namespacedId: DomId): PanelId => namespacedId.slice(20)
