export interface Debug {
	(arg: unknown): void;
	log?: (arg: string) => unknown;
	useColors: boolean;
	namespace: string;
	color: number;
	enabled?: boolean;
	extend: (namespace: string, delimiter?: string) => Debug;
}

export type State = {
	names: RegExp[];
	skips: RegExp[];
	namespaces: string | undefined;
	colors: number[];
	inspectOpts: Record<string, string | number | boolean | null | undefined>;
};
