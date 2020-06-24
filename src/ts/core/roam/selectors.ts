export const Selectors = {
    link: '.rm-page-ref',
    block: '.roam-block',
    blockInput: '.rm-block-input',
    blockContainer: '.roam-block-container',
    blockReference: '.rm-block-ref',
    title: '.rm-title-display',

    mainContent: '.roam-article',
    mainPanel: '.roam-body-main',

    sidebarContent: '.sidebar-content',
    sidebarPage: '.sidebar-content > div',
    sidebar: '#right-sidebar',

    leftPanel: '.roam-sidebar-container',

    foldButton: '.block-expand',
    highlight: '.block-highlight-blue',
    button: '.bp3-button',
    closeButton: '.bp3-icon-cross',
    viewMore: '.roam-log-preview',
    checkbox: '.check-container',
    externalLink: 'a',
    referenceItem: '.rm-reference-item',
    breadcrumbsContainer: '.zoom-mentions-view',
    pageReferenceItem: '.rm-ref-page-view',
    pageReferenceLink: '.rm-ref-page-view-title a span',
    caretButton: '.rm-caret',
    filterButton: '.bp3-icon.bp3-icon-filter',

    /**
     * Blocks in mentions may contain your actual email address, which messes up querySelector, unless
     * special characters are escaped.
     */
    escapeHtmlId: (htmlId: string) => htmlId.replace('.', '\\.').replace('@', '\\@'),
}
