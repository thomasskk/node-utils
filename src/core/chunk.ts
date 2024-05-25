export const chunk = <T = unknown>(arr: T[], n: number): T[][] => {
	return arr.reduce(
		(chunk: T[][], val) => {
			if (chunk[chunk.length - 1].length === n) chunk.push([]);
			chunk[chunk.length - 1].push(val);
			return chunk;
		},
		[[]],
	);
};
