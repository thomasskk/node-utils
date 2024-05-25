import stream from "node:stream";
import type { FuncResponse } from "./types.js";
import { getErrorMessage } from "./getErrorMessage.js";
import fs from "node:fs";

export const download = async (args: {
	url: string;
	dest: string;
}): Promise<FuncResponse> => {
	const { url, dest } = args;

	try {
		const res = await fetch(url);

		if (!res.body) {
			return {
				error: "No body in response",
				success: false,
			};
		}

		const readable = stream.Readable.fromWeb(res.body);
		const writeStream = fs.createWriteStream(dest);
		await stream.promises.finished(readable.pipe(writeStream));

		return {
			success: true,
		};
	} catch (e) {
		return {
			error: getErrorMessage(e),
			success: false,
		};
	}
};
