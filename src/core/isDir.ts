import fs from "node:fs";

export const isDir = async (path: string): Promise<boolean> => {
	try {
		const stats = await fs.promises.stat(path);
		return stats.isDirectory();
	} catch (error) {
		return false;
	}
};
