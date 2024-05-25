import util from "node:util";
import cp from "node:child_process";

export const execAsync = async (
	cmd: string,
	options: {
		log?: boolean;
	} = {},
) => {
	const { log = true } = options;

	const promise = util.promisify(cp.exec)(cmd);
	const child = promise.child;

	if (log) {
		child.stdout?.pipe(process.stdout);
		child.stderr?.pipe(process.stdout);
	}

	await promise;
};
