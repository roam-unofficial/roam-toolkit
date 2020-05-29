export function delay(millis: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, millis))
}

export function mapAsync<T, U>(
    array: T[],
    callbackfn: (value: T, index: number, array: T[]) => Promise<U>
): Promise<U[]> {
    return Promise.all(array.map(callbackfn))
}

export async function filterAsync<T>(
    array: T[],
    callbackfn: (value: T, index: number, array: T[]) => Promise<boolean>
): Promise<T[]> {
    const filterMap = await mapAsync(array, callbackfn)
    return array.filter((_value, index) => filterMap[index])
}

export async function forEachAsync<T>(
    array: T[],
    callbackfn: (value: T, ...args: any[]) => void
) {
    for await (const element of array) {
        await callbackfn(element, arguments)
    }
}

