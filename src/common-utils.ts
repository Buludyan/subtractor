


 export type NotNull<T> = T extends null ? never : T;
 export type NotUndefined<T> = T extends undefined ? never : T;
 export type NotNullNotUndefined<T> = NonNullable<T>;

export const isUndefined = (x: unknown): x is undefined => {
    return x === undefined;
}

export const isNull = (x: unknown): x is null => {
    return x === null;
}


export const throwIfNull = <T>(x: T, message: string): asserts x is NotNull<T> => {
    if(isNull(x)) {
        throw new Error(message);
    }
}
export const throwIfUndefined = <T>(x: T, message: string): asserts x is NotUndefined<T> => {
    if(isUndefined(x)) {
        throw new Error(message);
    }
}

export const sleep = (ms: number) => {
    return new Promise( resolve => setTimeout(resolve, ms) );
}