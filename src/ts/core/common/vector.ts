export type Vector = {x: number; y: number}

export const getDistance = (v1: Vector, v2: Vector) => Math.sqrt((v1.x - v2.x) ** 2 + (v1.y - v2.y) ** 2)

// degrees from startingAt -> startingAt + 360
export const getAngle = (v1: Vector, v2: Vector, startingAt = 0) => {
    // Normally, it'd be v2.y - v1.y, but the y axis is flipped
    const radians = Math.atan2(v1.y - v2.y, v2.x - v1.x)
    const degrees = (radians * 360) / (2 * Math.PI)
    return ((degrees + 360 - startingAt) % 360) + startingAt
}
