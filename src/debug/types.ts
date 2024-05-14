export interface Debug {
	(...args: unknown[]): void;
	log?: (...args: [string, ...unknown[]]) => unknown;
	useColors: boolean;
	namespace: string;
	color: number;
	enabled?: boolean;
	extend: (namespace: string, delimiter?: string) => Debug;
}

export type State = {
	names: RegExp[];
	skips: RegExp[];
	formatters: Record<string, (state: Debug, v: unknown) => string>;
	namespaces: string | undefined;
	colors: number[];
	inspectOpts: Record<string, string | number | boolean | null | undefined>;
};
