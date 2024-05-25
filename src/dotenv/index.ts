import nodePath from "node:path";
import fs from "node:fs";
import type { Options } from "./types.js";

const LINE =
	/(?:^|^)\s*(?:export\s+)?([\w.-]+)(?:\s*=\s*?|:\s+?)(\s*'(?:\\'|[^'])*'|\s*"(?:\\"|[^"])*"|\s*`(?:\\`|[^`])*`|[^#\r\n]+)?\s*(?:#.*)?(?:$|$)/gm;

const parse = (src: string) => {
	const obj: Record<string, string> = {};

	const lines = src.replace(/\r\n?/gm, "\n");
	const matches = lines.matchAll(LINE);

	for (const match of matches) {
		const [_, key, value] = match;

		const trimmed = value.trim();
		const isDoubleQuoted = trimmed[0] === '"';
		const withoutQuotes = value.replace(/^(['"`])([\s\S]*)\1$/gm, "$2");

		if (isDoubleQuoted) {
			obj[key] = withoutQuotes.replace(/\\n/g, "\n").replace(/\\r/g, "\r");
		} else {
			obj[key] = withoutQuotes;
		}
	}

	return obj;
};

export const dotenv = (options: Options = {}) => {
	const dotenvPath = nodePath.resolve(process.cwd(), ".env");
	const { paths = [dotenvPath] } = options;

	for (const path of paths) {
		const fileData = fs.readFileSync(path, { encoding: "utf8" });
		const parsed = parse(fileData);

		for (const key in parsed) {
			if (key in process.env) {
				continue;
			}
			process.env[key] = parsed[key];
		}
	}
};
