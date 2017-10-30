import pkg from './package.json';

import builtins from 'rollup-plugin-node-builtins';
import globals from 'rollup-plugin-node-globals';
import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';

export default [
  // browser-friendly UMD build
  {
    input: pkg.entry,
    output: {
      file: pkg.browser,
      format: 'umd',
    },
    name: pkg.moduleName,
    sourcemap: true,
    plugins: [
      resolve(),
      commonjs({ include: 'node_modules/**' }), // so Rollup can convert other modules to ES module
      globals(),
      builtins(),
      babel({
        exclude: 'node_modules/**',
        babelrc: false,
        presets: [ 'es2015-rollup' ]
      })
    ]
  },

  
  // CommonJS bundle has to be ES5 because it's the 'main' entry point so it has
  // to be 'required' and 'imported'
  {
    input: pkg.entry,
    output: {
      file: pkg.commonjs,
      format: 'cjs',
    },
    sourcemap: false,
    plugins: [
      resolve(),
      commonjs({ include: 'node_modules/**' }), // so Rollup can convert other modules to ES module
      globals(),
      builtins(),
      babel({
        exclude: 'node_modules/**',
        babelrc: false,
        presets: [ 'es2015-rollup' ]
      })
    ]
  },
  
  
  {
    input: pkg.entry,
    output: {
      file: pkg.module,
      format: 'es',
    },
    sourceMap: false,
    plugins: [
      resolve(), // so Rollup can find `ms`
      commonjs({ include: 'node_modules/**' }), // so Rollup can convert other modules to ES module
      globals(),
      builtins(),
      babel({
        exclude: 'node_modules/**',
        babelrc: false,
        presets: [ 'es2015-rollup' ]
      })
    ]
  },
  
  
];
