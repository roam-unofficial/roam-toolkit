export const invertObject = <K, V>(obj: {
    // @ts-ignore I dunno how to constrain the generics to work here
    [key: K]: V
}): {
    // @ts-ignore
    [key: V]: K
} => {
    const inverted = {}
    for (let [key, value] of Object.entries(obj)) {
        // Fallback to taking the first one, if multiple values conflict
        // @ts-ignore
        inverted[value] = inverted[value] || key
    }
    return inverted
}

export type ObjectMap<V> = {
    [key: string]: V,
}

export const mapObjectValues = <X, Y>(obj: ObjectMap<X>, mapFn: (x: X) => Y): ObjectMap<Y> => {
    let mapped: ObjectMap<Y> = {}
    Object.entries(obj).forEach(([key, value]) => {
        mapped[key] = mapFn(value)
    })
    return mapped
}

export const filterObjectValues = <X>(obj: ObjectMap<X>, mapFn: (x: X) => boolean): ObjectMap<X> => {
    let filtered: ObjectMap<X> = {}
    Object.entries(obj).forEach(([key, value]) => {
        if (mapFn(value)) {
            filtered[key] = value
        }
    })
    return filtered
}
