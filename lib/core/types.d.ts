type Success<T> = T extends undefined ? {
    data?: never;
    success: true;
} : {
    data: T;
    success: true;
};
type Error = {
    success: false;
    error: string;
};
export type FuncResponse<T = undefined> = Success<T> | Error;
export {};
