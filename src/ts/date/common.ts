import dateFormat from 'dateformat';

export const RoamDate = {
    formatString: `mmmm dS, yyyy`,
    pageFormatString() {
        return `'[['${this.formatString}']]'`
    },
    regex: /\[\[(January|February|March|April|May|June|July|August|September|October|November|December) \d{1,2}(st|nd|th|rd), \d{4}]]/gm,

    formatPage(date: Date) {
        return dateFormat(date, this.pageFormatString())
    },
    format(date: Date) {
        return dateFormat(date, this.formatString)
    },
    formatUS(date: Date) {
        return dateFormat(date, 'mm-dd-yyyy')
    }
}

export const dateFromPageName = (text: string): Date => {
    return new Date(
        text
            .slice(2)
            .slice(0, -2)
            .replace(/(th,|nd,|rd,|st,)/, ',')
    );
};

export function addDays(date: Date, days: number) {
    const result = new Date(date)
    result.setDate(result.getDate() + days)
    return result
}