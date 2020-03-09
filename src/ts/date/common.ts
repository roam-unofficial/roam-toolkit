import dateFormat from 'dateformat';

export const RoamDate = {
    formatString: `'[['mmmm dS, yyyy']]'`,
    regex: /\[\[(January|February|March|April|May|June|July|August|September|October|November|December) \d{1,2}(st|nd|th|rd), \d{4}\]\]/gm,

    format(date: Date) {
        return dateFormat(date, this.formatString)
    }
}
