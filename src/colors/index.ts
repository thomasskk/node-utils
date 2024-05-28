import { keys, styles } from "./constants.js";
import type { Colors } from "./types.js";

const obj = {};
const objProto = Object.getPrototypeOf(obj);
const keysSymbol = Symbol("keys");

for (const [key] of styles) {
	const k = keys[key];
	Object.defineProperty(objProto, key, {
		get() {
			if (keysSymbol in this) {
				this[keysSymbol].push(k);
				return this;
			}

			const o = Object.setPrototypeOf((arg = "") => {
				let beg = "";
				let end = "";
				let txt = arg;

				for (const { open, close, rgx } of o[keysSymbol]) {
					beg += open;
					end += close;
					if (txt.indexOf(close) !== -1) {
						txt = txt.replace(rgx, close + open);
					}
				}

				return beg + txt + end;
			}, objProto);
			o[keysSymbol] = [k];
			return o;
		},
	});
}

export const colors = obj as Colors;
