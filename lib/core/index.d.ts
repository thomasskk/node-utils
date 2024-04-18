import { FuncResponse } from './types.js';
export declare const valueInObj: <T extends Record<string | number | symbol, unknown>>(value: string | number | symbol, obj: T) => value is keyof T;
export declare const downloadFile: (args: {
    url: string;
    path: string;
}) => Promise<FuncResponse>;
export declare const getErrorMessage: (maybeError: unknown) => string;
