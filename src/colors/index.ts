import { keys, styles } from "./constants.js";
import type { Colors } from "./types.js";

const obj = {};
const objProto = Object.getPrototypeOf(obj);

for (const [key] of styles) {
	const k = keys[key];
	Object.defineProperty(objProto, key, {
		get() {
			if ("keys" in this) {
				this.keys.push(k);
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
			}, objProto);
			o.keys = [k];
			return o;
		},
	});
}

export const colors = obj as Colors;
