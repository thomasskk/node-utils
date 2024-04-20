import { FuncResponse } from './types.js';
export declare const valueInObj: <T extends Record<string | number | symbol, unknown>>(value: string | number | symbol, obj: T) => value is keyof T;
export declare const download: (args: {
    url: string;
    dest: string;
}) => Promise<FuncResponse>;
export declare const getErrorMessage: (maybeError: unknown) => string;
export declare const isDir: (path: string) => Promise<boolean>;
export declare const execAsync: (cmd: string, options?: {
    log?: boolean;
}) => Promise<void>;
export declare const chunk: <T = unknown>(arr: T[], n: number) => T[][];
export declare const gzip: (input: string, output: string) => Promise<FuncResponse>;
export declare const unzip: (input: string, output: string) => Promise<FuncResponse>;
