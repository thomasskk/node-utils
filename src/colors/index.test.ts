import { test, expect } from "vitest";
import { colors } from "./index.js";

test("style string", () => {
	expect(colors.underline("foo")).toEqual("\x1b[4mfoo\x1b[24m");
	expect(colors.red("foo")).toEqual("\x1b[31mfoo\x1b[39m");
	expect(colors.bgRed("foo")).toEqual("\x1b[41mfoo\x1b[49m");
});

test("support applying multiple styles at once", () => {
	expect(colors.red.bgGreen.underline("foo")).toEqual(
		"\x1b[31m\x1b[42m\x1b[4mfoo\x1b[39m\x1b[49m\x1b[24m",
	);
	expect(colors.underline.red.bgGreen("foo")).toEqual(
		"\x1b[4m\x1b[31m\x1b[42mfoo\x1b[24m\x1b[39m\x1b[49m",
	);
});

test("support nesting styles", () => {
	expect(colors.red(`foo${colors.underline.bgBlue("bar")}!`)).toEqual(
		"\x1b[31mfoo\x1b[4m\x1b[44mbar\x1b[24m\x1b[49m!\x1b[39m",
	);
});

test("support nesting styles of the same type (color, underline, bg)", () => {
	expect(colors.red(`a${colors.yellow(`b${colors.green("c")}b`)}c`)).toEqual(
		"\x1b[31ma\x1b[33mb\x1b[32mc\x1b[39m\x1b[31m\x1b[33mb\x1b[39m\x1b[31mc\x1b[39m",
	);
});

test("support caching multiple styles", () => {
	const redBold = colors.red.bold;
	const greenBold = colors.green.bold;

	expect(redBold("bar")).not.toEqual(greenBold("bar"));
});
