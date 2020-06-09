
export const assumeExists = <T>(x: T | null, errorMessage='Assumed that variable exists, but it does not'): T => {
    if (!x) {
        throw new Error(errorMessage);
    }
    return x;
}
