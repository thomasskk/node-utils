import terser from "@rollup/plugin-terser";
import typescript from "@rollup/plugin-typescript";

export default {
  input: "dist/index.js",
  plugins: [
    typescript({
      tsconfig: "tsconfig.json",
      outDir: "lib",
      include: ["src/**/*.ts"],
    }),
    terser(),
  ],
  output: [
    {
      format: "esm",
      file: "lib/index.mjs",
    },
  ],
};
