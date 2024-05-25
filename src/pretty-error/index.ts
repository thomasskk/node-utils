import { colors } from "../colors/index.js";
import util from "node:util";

export const prettyError = (err: unknown): string => {
	if (
		typeof err === "object" &&
		err != null &&
		"name" in err &&
		typeof err.name === "string" &&
		"message" in err &&
		typeof err.message === "string" &&
		"stack" in err &&
		typeof err.stack === "string"
	) {
		const str = `${colors.red(err.name)}: ${err.message.replace(
			new RegExp(`^${err.name}[: ]*`),
			"",
		)}\n${(err.stack || "")
			.split("\n")
			.filter(
				(line) =>
					!/\(node:/.test(line) &&
					!line.startsWith(`${err.name}: ${err.message}`),
			)
			.map((l) => {
				const line = l.trim();

				if (line.startsWith("at")) {
					return `  ${colors.gray(line)}`;
				}

				return line;
			})
			.filter(Boolean)
			.join("\n")}`;

		const contextKeys = Object.keys(err).filter(
			(key) => "message" !== key && "stack" !== key,
		);

		if (contextKeys.length === 0) {
			return str;
		}

		const context = util.inspect(
			contextKeys.reduce<Record<string, unknown>>((acc, key) => {
				acc[key] = err[key as keyof typeof err];
				return acc;
			}, {}),
			{
				colors: true,
				depth: 5,
			},
		);

		return (
			str +
			colors.magenta("\nThe above error also had these properties on it:\n") +
			context
		);
	}

	return String(err);
};
