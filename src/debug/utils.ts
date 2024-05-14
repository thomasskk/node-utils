import util from "node:util";
import type { State } from "./types.js";
import tty from "node:tty";

export const enable = (
	state: State,
	namespaces: string | boolean | undefined,
) => {
	process.env.DEBUG = namespaces !== undefined ? String(namespaces) : undefined;

	state.namespaces = String(namespaces);

	state.names = [];
	state.skips = [];

	const split = (typeof namespaces === "string" ? namespaces : "").split(
		/[\s,]+/,
	);

	for (const namespace of split) {
		if (!namespace) {
			continue;
		}

		const lazyNameSpace = namespace.replace(/\*/g, ".*?");

		if (lazyNameSpace[0] === "-") {
			state.skips.push(new RegExp(`^${lazyNameSpace.slice(1)}\$`));
		} else {
			state.names.push(new RegExp(`^${lazyNameSpace}\$`));
		}
	}
};

const toNamespace = (regexp: RegExp) => {
	return regexp
		.toString()
		.substring(2, regexp.toString().length - 2)
		.replace(/\.\*\?$/, "*");
};

export const disable = (state: State) => {
	const namespaces = [
		...state.names.map(toNamespace),
		...state.skips.map(toNamespace).map((namespace) => `-${namespace}`),
	].join(",");
	enable(state, "");
	return namespaces;
};

export const selectColor = (state: State, namespace: string): number => {
	let hash = 0;

	for (let i = 0; i < namespace.length; i++) {
		hash = (hash << 5) - hash + namespace.charCodeAt(i);
		hash |= 0; // Convert to 32bit integer
	}

	return state.colors[Math.abs(hash) % state.colors.length];
};

export const coerce = (val: unknown): unknown => {
	if (val instanceof Error) {
		return val.stack || val.message;
	}
	return val;
};

export const enabled = (state: State, name: string): boolean => {
	if (name[name.length - 1] === "*") {
		return true;
	}

	for (const regexp of state.skips) {
		if (regexp.test(name)) {
			return false;
		}
	}

	for (const regexp of state.names) {
		if (regexp.test(name)) {
			return true;
		}
	}

	return false;
};

export const useColors = (state: State) => {
	return "colors" in state.inspectOpts
		? Boolean(state.inspectOpts.colors)
		: tty.isatty(process.stderr.fd);
};

const getDate = (state: State) => {
	if (state.inspectOpts.hideDate) {
		return "";
	}
	return `${new Date().toISOString()} `;
};

export const formatArgs = (
	state: State,
	{
		namespace,
		useColors,
		diff,
		color,
	}: {
		namespace: string;
		useColors: boolean;
		diff: number;
		color: number;
	},
	args: [string, ...unknown[]],
) => {
	if (useColors) {
		const colorCode = `\u001B[3${color < 8 ? color : `8;5;${color}`}`;
		const prefix = `  ${colorCode};1m${namespace} \u001B[0m`;

		args[0] = prefix + args[0].split("\n").join(`\n${prefix}`);
		args.push(`${colorCode}m+${diff}\u001B[0m`);
	} else {
		args[0] = `${getDate(state)}${namespace} ${args[0]}`;
	}
};

export const log = (state: State, ...args: [string, ...unknown[]]): boolean => {
	return process.stderr.write(
		`${util.formatWithOptions(state.inspectOpts, ...args)}\n`,
	);
};

export const getInspectOpts = () =>
	Object.keys(process.env)
		.filter((key) => {
			return /^debug_/i.test(key);
		})
		.reduce<Record<string, null | number | boolean | string | undefined>>(
			(obj, key) => {
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

				const asNumber = Number(v);

				if (!Number.isNaN(asNumber)) {
					obj[prop] = Number(v);
				} else {
					obj[prop] = v;
				}

				return obj;
			},
			{},
		);
