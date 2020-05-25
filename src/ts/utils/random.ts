export const randomFromInterval = (
    min: number,
    max: number // min and max included
) => Math.random() * (max - min + 1) + min
