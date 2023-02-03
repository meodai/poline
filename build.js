import { build } from "esbuild";

// Bundled CJS
build({
  entryPoints: ["./src/index.ts"],
  logLevel: "info",
  bundle: true,
  format: "cjs",
  outfile: "dist/index.cjs",
});

// Bundled CJS, minified
build({
  entryPoints: ["./src/index.ts"],
  logLevel: "info",
  bundle: true,
  minify: true,
  format: "cjs",
  outfile: "dist/index.min.cjs",
});

// Bundled ESM
build({
  entryPoints: ["./src/index.ts"],
  logLevel: "info",
  bundle: true,
  format: "esm",
  target: "es2020",
  outfile: "dist/index.mjs",
});

// Bundled ESM, minified
build({
  entryPoints: ["./src/index.ts"],
  logLevel: "info",
  bundle: true,
  minify: true,
  format: "esm",
  target: "es2020",
  outfile: "dist/index.min.mjs",
});

// Bundled IIFE
build({
  entryPoints: ["./src/index.ts"],
  logLevel: "info",
  bundle: true,
  format: "iife",
  target: "node14",
  globalName: "poline",
  outfile: "dist/index.js",
});

// Bundled IIFE, minified
build({
  entryPoints: ["./src/index.ts"],
  logLevel: "info",
  bundle: true,
  minify: true,
  format: "iife",
  target: "es6",
  globalName: "poline",
  outfile: "dist/index.min.js",
});

// Bundled UMD
// Adapted from: https://github.com/umdjs/umd/blob/master/templates/returnExports.js
build({
  entryPoints: ["./src/index.ts"],
  logLevel: "info",
  bundle: true,
  format: "iife",
  target: "es6",
  globalName: "poline",
  banner: {
    js: `(function(root, factory) {
      if (typeof define === 'function' && define.amd) {
      	define([], factory);
      } else if (typeof module === 'object' && module.exports) {
      	module.exports = factory();
      } else {
      	root.poline = factory();
      }
    }
    (typeof self !== 'undefined' ? self : this, function() {`,
  },
  footer: {
    js: `return poline; }));`,
  },
  outfile: "dist/index.umd.js",
});
