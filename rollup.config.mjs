import terser from '@rollup/plugin-terser'
import typescript from '@rollup/plugin-typescript'

/** @type {import("rollup").RollupOptions} */
export default {
  input: 'src/index.ts',
  plugins: [
    typescript({
      tsconfig: 'tsconfig.build.json',
      outDir: 'lib',
      rootDir: 'src',
    }),
    terser(),
  ],
  output: [
    {
      format: 'esm',
      file: 'lib/index.mjs',
    },
  ],
}
