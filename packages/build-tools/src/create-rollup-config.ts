import { RollupOptions, InputOption, OutputOptions } from 'rollup';

import commonjs from '@rollup/plugin-commonjs';
// import builtins from 'rollup-plugin-node-builtins';
import image from '@rollup/plugin-image';
import json from '@rollup/plugin-json';
import babel from 'rollup-plugin-babel';
import scss from 'rollup-plugin-scss';
import resolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import url from '@rollup/plugin-url';
import path from 'path';

const isProd = process.env.NODE_ENV === 'production';

const extensions = ['.ts', '.tsx', '.js', '.jsx', '.mjs'];

/**
 * Either a function that takes an id and returns true (external) or false (not external), or an Array of module IDs that should remain external to the bundle.
 * The IDs should be either:
 * 1) the name of an external dependency, exactly the way it is written in the import statement. I.e. to mark import "dependency.js" as external, use "dependency.js" while to mark import "dependency" as external, use "dependency".
 * 2) a resolved ID (like an absolute path to a file).
 * @link https://rollupjs.org/guide/en/#core-functionality
 */
function externalAll(
  id: string,
  parentId: string,
  isResolved: boolean,
): boolean {
  // this means it is inside this package; not external
  if (id.startsWith('.')) return false;
  if (path.isAbsolute(id)) {
    if (id.includes('node_modules')) return true;
    // it's inside here
    if (id.startsWith(__dirname)) return false;
    if (path.relative(__dirname, id).startsWith('..')) {
      console.error({ id, parentId, isResolved });
      throw new Error(`should not include something outside this directory`);
    }
  }

  // if not, then it's a dependency
  return true;
}

export function createRollupConfig({
  input,
  distDir,
  watchIncludes,
  external = externalAll,
  globals = {},
  cssOutputFile,
}: {
  input: InputOption;
  distDir: string;
  watchIncludes?: string[];
  external?: RollupOptions['external'];
  globals?: OutputOptions['globals'];
  /**
   * Filename to write css to, can use `/` for subdirs
   */
  cssOutputFile?: string;
}) {
  const config: RollupOptions = {
    input,
    output: {
      format: 'esm',
      dir: distDir,
      entryFileNames: '[name].js',
      assetFileNames: 'assets/[name]-[hash][extname]',
      chunkFileNames: '[name]-[hash].js',
      // sourcemap: 'inline',
      globals,
    },
    // preserveModules: true,
    external,
    // experimentalOptimizeChunks: true,
    // chunkGroupingSize: 100,
    // manualChunks
    // perf: true,
    // preserveSymlinks: true,
    watch: {
      include: watchIncludes,
    },
    plugins: [
      babel({
        // extends: babelConfig,
        extensions,
        exclude: /node_modules/,
        runtimeHelpers: true,
      }),
      cssOutputFile
        ? scss({
            output: cssOutputFile,
          })
        : null,
      resolve({
        extensions,
      }),
      image(),
      replace({
        'process.env.NODE_ENV': JSON.stringify(
          isProd ? 'production' : 'development',
        ),
      }),
      commonjs({
        include: /node_modules/,
        // /**
        //  * When `import`ing named exports from CJS modules, (e.g. `import React, { PureComponent } from "react"`)
        //  * Rollup sometimes doesn't guess the exports correctly,
        //  * and you need to define them explicitly here.
        //  * @todo consider using `require.resolve()` instead of `./node_modules/react/index.js`
        //  */
        // namedExports: {
        //   './node_modules/react/index.js': [
        //     'cloneElement',
        //     'createElement',
        //     'PropTypes',
        //     'Children',
        //     'Component',
        //     'createFactory',
        //     'PureComponent',
        //     'lazy',
        //     'Suspense',
        //     'useState',
        //     'useEffect',
        //   ],
        //   './node_modules/react-dom/index.js': ['findDOMNode'],
        //   './node_modules/babel-runtime/node_modules/core-js/library/modules/es6.object.to-string.js': [
        //     'default',
        //   ],
        //   './node_modules/process/browser.js': ['nextTick'],
        //   './node_modules/events/events.js': ['EventEmitter'],
        //   './node_modules/react-is/index.js': ['isValidElementType'],
        // },
      }),
      json(),
      url({
        limit: Infinity,
        // limit: 1000 * 30, // kb
        include: [
          '**/*.svg',
          '**/*.png',
          '**/*.jpg',
          '**/*.gif',
          '**/*.woff',
          '**/*.woff2',
        ],
      }),
    ].filter(Boolean),
    onwarn(warning) {
      // Skip certain warnings

      // should intercept ... but doesn't in some rollup versions
      if (warning.code === 'THIS_IS_UNDEFINED') {
        return;
      }

      // console.warn everything else
      console.warn(warning.message);
    },
  };

  return config;
}
