export const Selectors = {
    link: '.rm-page-ref',
    block: '.roam-block',
    blockInput: '.rm-block-input',
    blockContainer: '.roam-block-container',
    blockReference: '.rm-block-ref',
    title: '.rm-title-display',

    mainContent: '.roam-article',
    mainPanel: '.roam-body-main',

    sidebarContent: '#roam-right-sidebar-content',
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
    caretButton: '.rm-caret',

    /**
     * Blocks in mentions may contain your actual email address, which messes up querySelector, unless
     * special characters are escaped.
     */
    escapeHtmlId: (htmlId: string) => htmlId.replace('.', '\\.').replace('@', '\\@'),
}
