export function addDays(date: Date, days: number) {
    const result = new Date(date)
    result.setDate(result.getDate() + days)
    return result
}

export const isValid = (date: Date) => !isNaN(date.getTime())