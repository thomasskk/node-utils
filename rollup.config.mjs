import terser from "@rollup/plugin-terser";
import typescript from "@rollup/plugin-typescript";
import fs from "node:fs";

const dir = await fs.promises.readdir("src");
const input = dir.reduce((input, file) => {
	input[file] = `src/${file}/index.ts`;
	return input;
}, {});

/** @type {import("rollup").RollupOptions} */
export default {
	input,
	plugins: [
		typescript({
			tsconfig: "tsconfig.build.json",
			outDir: "lib",
			rootDir: "src",
		}),
		terser(),
	],
	output: [
		{
			format: "esm",
			dir: "lib",
			entryFileNames: "[name]/index.mjs",
		},
	],
};
