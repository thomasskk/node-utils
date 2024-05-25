export const isNodeEnv =
	Object.prototype.toString.call(
		typeof process !== "undefined" ? process : 0,
	) === "[object process]";
