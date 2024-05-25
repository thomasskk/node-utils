import chalk from "chalk";
import { Bench } from "tinybench";
import { colors } from "./index.js";

const bench = new Bench({ time: 100 });

bench
	.add("chalk 1 style", () => {
		chalk.red("the fox jumps over the lazy dog");
	})
	.add("colors 1 style", () => {
		colors.red("the fox jumps over the lazy dog");
	})
	.add("chalk 2 style", () => {
		chalk.red.underline("the fox jumps over the lazy dog");
	})
	.add("colors 2 style", () => {
		colors.red.underline("the fox jumps over the lazy dog");
	});

await bench.warmup();
await bench.run();

console.table(bench.table());
