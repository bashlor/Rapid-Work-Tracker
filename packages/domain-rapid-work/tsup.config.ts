import { defineConfig } from "tsup";

export default defineConfig({
  clean: true,
  dts: true,
  entry: ["index.ts"],
  format: ["esm"],
  noExternal: ["uuid","luxon"],
  sourcemap: false,
  splitting: false,
});
