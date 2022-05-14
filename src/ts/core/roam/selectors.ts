export const Selectors = {
    link: '.rm-page-ref',
    hiddenSection: '.rm-block__part--equals',
    block: '.roam-block',
    blockInput: '.rm-block-input',
    blockContainer: '.roam-block-container',
    blockReference: '.rm-block-ref',
    blockBulletView: '.block-bullet-view',
    title: '.rm-title-display',

    main: '.roam-main',
    mainContent: '.roam-article',
    mainBody: '.roam-body-main',

    sidebarContent: '.sidebar-content',
    sidebarPage: '.sidebar-content > div > div',
    sidebar: '#right-sidebar',
    sidebarScrollContainer: '#roam-right-sidebar-content',

    leftPanel: '.roam-sidebar-container',

    topBar: '.rm-topbar',

    foldButton: '.rm-caret',
    highlight: '.block-highlight-blue',
    button: '.bp3-button',
    closeButton: '.bp3-icon-cross',
    dailyNotes: '#rm-log-container',
    viewMore: '.roam-log-preview',
    checkbox: '.check-container',
    externalLink: 'a.rm-alias',
    embedPageTitle: '.rm-embed--page a span.rm-page__title',
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
