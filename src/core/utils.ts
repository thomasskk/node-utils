import { pipeline } from "node:stream";
import { promisify } from "node:util";

export const pipe = promisify(pipeline);
