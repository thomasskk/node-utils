import type { Debug, State } from "./types.js";
import {
	coerce,
	useColors,
	selectColor,
	enabled,
	disable,
	formatArg,
	log,
	enable,
	getInspectOpts,
} from "./utils.js";

const state: State = {
	names: [],
	skips: [],
	namespaces: "",
	colors: [
		20, 21, 26, 27, 32, 33, 38, 39, 40, 41, 42, 43, 44, 45, 56, 57, 62, 63, 68,
		69, 74, 75, 76, 77, 78, 79, 80, 81, 92, 93, 98, 99, 112, 113, 128, 129, 134,
		135, 148, 149, 160, 161, 162, 163, 164, 165, 166, 167, 168, 169, 170, 171,
		172, 173, 178, 179, 184, 185, 196, 197, 198, 199, 200, 201, 202, 203, 204,
		205, 206, 207, 208, 209, 214, 215, 220, 221,
	],
	inspectOpts: getInspectOpts(),
};

const createDebug = (namespace: string) => {
	let enableOverride: null | unknown = null;
	let namespacesCache: string | undefined;
	let enabledCache: boolean;

	enable(state, process.env.DEBUG);

	const debug: Debug = (arg) => {
		if (!debug.enabled) {
			return;
		}

		const formatedArg = formatArg(
			{
				useColors: debug.useColors,
				namespace: debug.namespace,
				color: debug.color,
			},
			coerce(arg),
		);

		if (debug.log) {
			debug.log(formatedArg);
		} else {
			log(state, formatedArg);
		}
	};

	debug.useColors = useColors(state);
	debug.namespace = namespace;
	debug.color = selectColor(state, namespace);
	debug.extend = (namespace: string, delimiter = ":") => {
		const newNamespace = `${debug.namespace}${delimiter}${namespace}`;

		const newDebug = createDebug(newNamespace);

		newDebug.log = debug.log;
		return newDebug;
	};

	Object.defineProperty(debug, "enabled", {
		enumerable: true,
		configurable: false,
		get: () => {
			if (enableOverride !== null) {
				return enableOverride;
			}

			if (namespacesCache !== state.namespaces) {
				namespacesCache = state.namespaces;
				enabledCache = enabled(state, namespace);
			}

			return enabledCache;
		},
		set: (v) => {
			enableOverride = v;
		},
	});

	return debug;
};

createDebug.enable = (namespace: string | boolean | undefined) =>
	enable(state, namespace);
createDebug.disable = () => disable(state);
createDebug.skips = state.skips;
createDebug.names = state.names;

enable(state, process.env.DEBUG);

export default createDebug;
