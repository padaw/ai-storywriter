export function wait<T>(fn: () => T, time: number): Promise<T> {
    return new Promise<T>((res) => {
        setTimeout(() => {
            res(fn());
        }, time);
    });
}
