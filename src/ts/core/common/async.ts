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

export async function repeatAsync<T>(n: number, callbackFn: () => Promise<T>) {
    for (let i = 0; i < n; i++) {
        await callbackFn()
    }
}
