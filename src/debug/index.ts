import util from "node:util";
import tty from "node:tty";

type State = {
	color: number;
	diff?: number;
	namespace: string;
	useColors: boolean;
	prev?: number;
	curr?: number;
	inspectOpts: Record<string, null | number | boolean>;
};

const glob: {
	names: RegExp[];
	skips: RegExp[];
	formatters: Record<string, (state: State, v: unknown) => string>;
	namespaces: string | undefined;
	colors: number[];
} = {
	names: [],
	skips: [],
	formatters: {},
	namespaces: "",
	colors: [
		20, 21, 26, 27, 32, 33, 38, 39, 40, 41, 42, 43, 44, 45, 56, 57, 62, 63, 68,
		69, 74, 75, 76, 77, 78, 79, 80, 81, 92, 93, 98, 99, 112, 113, 128, 129, 134,
		135, 148, 149, 160, 161, 162, 163, 164, 165, 166, 167, 168, 169, 170, 171,
		172, 173, 178, 179, 184, 185, 196, 197, 198, 199, 200, 201, 202, 203, 204,
		205, 206, 207, 208, 209, 214, 215, 220, 221,
	],
};

const enable = (namespaces: string | boolean | undefined) => {
	process.env.DEBUG = namespaces !== undefined ? String(namespaces) : undefined;

	glob.namespaces = String(namespaces);

	glob.names = [];
	glob.skips = [];

	const split = (typeof namespaces === "string" ? namespaces : "").split(
		/[\s,]+/,
	);

	for (const namespace of split) {
		if (!namespace) {
			continue;
		}

		const lazyNameSpace = namespace.replace(/\*/g, ".*?");

		if (lazyNameSpace[0] === "-") {
			glob.skips.push(new RegExp(`^${lazyNameSpace.slice(1)}\$`));
		} else {
			glob.names.push(new RegExp(`^${lazyNameSpace}\$`));
		}
	}
};

const toNamespace = (regexp: RegExp) => {
	return regexp
		.toString()
		.substring(2, regexp.toString().length - 2)
		.replace(/\.\*\?$/, "*");
};

const disable = () => {
	const namespaces = [
		...glob.names.map(toNamespace),
		...glob.skips.map(toNamespace).map((namespace) => `-${namespace}`),
	].join(",");
	enable("");
	return namespaces;
};

const inspectOpts = Object.keys(process.env)
	.filter((key) => {
		return /^debug_/i.test(key);
	})
	.reduce<Record<string, null | number | boolean>>((obj, key) => {
		const prop = key
			.substring(6)
			.toLowerCase()
			.replace(/_([a-z])/g, (_, k) => {
				return k.toUpperCase();
			});

		const v = process.env[key];

		if (v === "yes" || v === "on" || v === "true" || v === "enabled") {
			obj[prop] = true;
			return obj;
		}

		if (v === "no" || v === "off" || v === "false" || v === "disabled") {
			obj[prop] = false;
			return obj;
		}

		if (v === "null") {
			obj[prop] = null;
			return obj;
		}

		obj[prop] = Number(v);
		return obj;
	}, {});

const selectColor = (namespace: string): number => {
	let hash = 0;

	for (let i = 0; i < namespace.length; i++) {
		hash = (hash << 5) - hash + namespace.charCodeAt(i);
		hash |= 0; // Convert to 32bit integer
	}

	return glob.colors[Math.abs(hash) % glob.colors.length];
};

const coerce = (val: unknown): unknown => {
	if (val instanceof Error) {
		return val.stack || val.message;
	}
	return val;
};

const enabled = (name: string): boolean => {
	if (name[name.length - 1] === "*") {
		return true;
	}

	for (const regexp of glob.skips) {
		if (regexp.test(name)) {
			return false;
		}
	}

	for (const regexp of glob.names) {
		if (regexp.test(name)) {
			return true;
		}
	}

	return false;
};

const useColors = () => {
	return "colors" in inspectOpts
		? Boolean(exports.inspectOpts.colors)
		: tty.isatty(process.stderr.fd);
};

const setup = (namespace: string) => {
	let prevTime: number | undefined;
	let enableOverride: null | unknown = null;
	let namespacesCache: string;
	let enabledCache: boolean;

	class Debugger extends Function {
		public log?: (...args: [string, ...unknown[]]) => unknown;
		public enable = enable;

		#execute(...args: unknown[]) {
			if (!this.enabled) {
				return;
			}

			const curr = Number(new Date());
			const ms = curr - (prevTime || curr);

			this.state.diff = ms;
			this.state.prev = prevTime;
			this.state.curr = curr;

			prevTime = curr;

			args[0] = coerce(args[0]);

			if (typeof args[0] !== "string") {
				args.unshift("%O");
			}

			const tupleArgs = args as [string, ...unknown[]];

			let index = 0;

			tupleArgs[0] = tupleArgs[0].replace(/%([a-zA-Z%])/g, (match, format) => {
				// If we encounter an escaped % then don't increase the array index
				if (match === "%%") {
					return "%";
				}
				index++;
				const formatter = glob.formatters[format];
				if (typeof formatter === "function") {
					const val = args[index];
					args.splice(index, 1);
					index--;
					return formatter(this.state, val);
				}

				return match;
			});

			this.#formatArgs(tupleArgs);

			const logFn = this.log || this.#log;
			logFn(...tupleArgs);
		}

		#log(...args: [string, ...unknown[]]): boolean {
			return process.stderr.write(`${util.format(...args)}\n`);
		}

		#getDate() {
			if (this.state.inspectOpts.hideDate) {
				return "";
			}
			return `${new Date().toISOString()} `;
		}

		#formatArgs(args: [string, ...unknown[]]) {
			const { namespace: name, useColors, diff, color: c } = this.state;
			if (useColors) {
				const colorCode = `\u001B[3${c < 8 ? c : `8;5;${c}`}`;
				const prefix = `  ${colorCode};1m${name} \u001B[0m`;

				args[0] = prefix + args[0].split("\n").join(`\n${prefix}`);
				args.push(`${colorCode}m+${diff}\u001B[0m`);
			} else {
				args[0] = `${this.#getDate()}${name} ${args[0]}`;
			}
		}

		extend(namespace: string, delimiter = ":") {
			const newNamespace = `${this.state.namespace}${delimiter}${namespace}`;

			const newDebug = new Debugger({
				namespace: newNamespace,
				useColors: this.state.useColors,
				color: this.state.color,
				inspectOpts: this.state.inspectOpts,
			});

			newDebug.log = this.log;
			return newDebug;
		}

		set enabled(v) {
			enableOverride = v;
		}

		get namespace() {
			return this.state.namespace;
		}

		set namespace(v) {
			this.state.namespace = v;
		}

		get enabled() {
			if (enableOverride !== null) {
				return enableOverride;
			}

			if (namespacesCache !== glob.namespaces) {
				if (glob.namespaces !== undefined) {
					namespacesCache = glob.namespaces;
				}
				enabledCache = enabled(namespace);
			}

			return enabledCache;
		}

		constructor(public state: State) {
			super();

			enable(process.env.DEBUG);

			// biome-ignore lint:
			return new Proxy(this, {
				get: (target, prop, receiver) => {
					if (prop in target) {
						return Reflect.get(target, prop, receiver);
					}

					return Reflect.get(this.#execute, prop, this.#execute);
				},
				apply: (_target, _thisArg, argumentsList) => {
					this.#execute(argumentsList);
				},
			});
		}
	}

	return new Debugger({
		color: selectColor(namespace),
		namespace,
		useColors: useColors(),
		prev: undefined,
		inspectOpts: { ...inspectOpts },
	});
};

setup.enable = enable;
setup.disable = disable;
setup.skips = glob.skips;
setup.names = glob.names;

export default setup;

enable(process.env.DEBUG);

glob.formatters.o = (s, v) => {
	inspectOpts.colors = s.useColors;
	return util
		.inspect(v, s.inspectOpts)
		.split("\n")
		.map((str) => str.trim())
		.join(" ");
};

glob.formatters.O = (s, v) => {
	s.inspectOpts.colors = s.useColors;
	return util.inspect(v, s.inspectOpts);
};
