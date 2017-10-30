import pkg from './package.json';

/*
    The dev version of the Rollup config does not transpile to ES5
    and outputs a single umd package.
*/

import commonjs from 'rollup-plugin-commonjs';
import nodeResolve from 'rollup-plugin-node-resolve';
//import bundleWorker from 'rollup-plugin-bundle-worker';
import builtins from 'rollup-plugin-node-builtins';
import globals from 'rollup-plugin-node-globals';


export default [
  {
    input: pkg.entry,
    output: {
      file: pkg.browser,
      format: 'umd'
    },
    name: pkg.moduleName,
    sourcemap: true,
    plugins: [
      nodeResolve({
        preferBuiltins: false
      }),
      commonjs(),
      //bundleWorker(),
      globals(),
      builtins()
    ]
  }
];
