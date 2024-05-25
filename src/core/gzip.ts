import zlib from "node:zlib";
import { Readable } from "node:stream";
import { createReadStream, createWriteStream } from "node:fs";
import { getBufferFromStream } from "./getBufferFromStream.js";
import { pipe } from "./utils.js";

export const gzip = (
	args:
		| {
				path: string;
				data?: never;
		  }
		| {
				data: Buffer;
				path?: never;
		  },
): {
	getStream: () => Readable;
	writeTo: (output: string) => Promise<void>;
	getBuffer: () => Promise<Buffer>;
} => {
	const { path, data } = args;
	const gzip = zlib.createGzip({
		level: zlib.constants.Z_BEST_COMPRESSION,
	});
	const source =
		data !== undefined ? Readable.from(data) : createReadStream(path);

	return {
		getStream() {
			return source.pipe(gzip);
		},
		async writeTo(output: string) {
			const destination = createWriteStream(output);
			await pipe(source, gzip, destination);
		},
		async getBuffer() {
			return getBufferFromStream(source.pipe(gzip));
		},
	};
};
