import { keys, styles } from "./constants.js";
import type { Colors } from "./types.js";

const obj = {};

for (const [key] of styles) {
	const k = keys[key];
	Object.defineProperty(Object.getPrototypeOf(obj), key, {
		get() {
			if (this.keys?.push(k)) {
				return this;
			}

			const o = Object.setPrototypeOf((arg = "") => {
				let beg = "";
				let end = "";
				let txt = arg;

				for (const { open, close, rgx } of o.keys) {
					beg += open;
					end += close;
					if (txt.indexOf(close) !== -1) {
						txt = txt.replace(rgx, close + open);
					}
				}

				return beg + txt + end;
			}, Object.getPrototypeOf(obj));
			o.keys = [k];
			return o;
		},
	});
}

export const colors = obj as Colors;
