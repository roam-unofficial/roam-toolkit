export const Selectors = {
    link: '.rm-page-ref',
    block: '.roam-block',
    blockInput: '.rm-block-input',
    blockContainer: '.roam-block-container',
    blockReference: '.rm-block-ref',
    blockBulletView: '.block-bullet-view',
    title: '.rm-title-display',

    mainContent: '.roam-article',
    mainPanel: '.roam-body-main',

    sidebarContent: '#roam-right-sidebar-content',
    sidebarPage: '#right-sidebar > div',
    sidebar: '#right-sidebar',

    leftPanel: '.roam-sidebar-container',

    foldButton: '.rm-caret',
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
    filterButton: '.bp3-icon.bp3-icon-filter',

    /**
     * Blocks in mentions may contain your actual email address, which messes up querySelector, unless
     * special characters are escaped.
     */
    escapeHtmlId: (htmlId: string) => htmlId.replace('.', '\\.').replace('@', '\\@'),
}
