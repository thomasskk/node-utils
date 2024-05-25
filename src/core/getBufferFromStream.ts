import type { Readable } from "node:stream";

export const getBufferFromStream = async (
	stream: Readable,
): Promise<Buffer> => {
	const chunks: Buffer[] = [];
	stream.on("data", (chunk) => {
		chunks.push(chunk);
	});
	await new Promise((resolve) => stream.on("end", resolve));
	return Buffer.concat(chunks);
};
