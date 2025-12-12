import * as esbuild from "esbuild";

const watch = process.argv.slice(2).at(0) === "watch";

/**
 * @type {esbuild.BuildOptions}
 */
const config = {
  bundle: true,
  splitting: true,
  platform: "browser",
  format: "esm",
  sourcemap: "external",
  outdir: "dist",
  entryPoints: ["src/index.ts"],
};

if (watch) {
  (await esbuild.context(config)).watch();
} else {
  await esbuild.build(config);
}
