export type Styles =
	| "bold"
	| "dim"
	| "italic"
	| "underline"
	| "overline"
	| "inverse"
	| "hidden"
	| "strikethrough"
	| "black"
	| "red"
	| "green"
	| "yellow"
	| "blue"
	| "magenta"
	| "cyan"
	| "white"
	| "gray"
	| "grey"
	| "bgBlack"
	| "bgRed"
	| "bgGreen"
	| "bgYellow"
	| "bgBlue"
	| "bgMagenta"
	| "bgCyan"
	| "bgWhite";

export type StylesMap = Record<Styles, [number, number]>;

export type Colors = {
	[key in Styles]: Colors & ((text?: string) => string);
};

export type Key = {
	open: string;
	close: string;
	rgx: RegExp;
};
