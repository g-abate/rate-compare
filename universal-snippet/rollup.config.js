import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';
import { readFileSync } from 'fs';

const packageJson = JSON.parse(readFileSync('./package.json', 'utf8'));

export default [
  // Main build
  {
    input: 'src/index.ts',
    output: [
      {
        file: packageJson.main,
        format: 'umd',
        name: 'RateCompare',
        sourcemap: true,
      },
      {
        file: packageJson.module,
        format: 'esm',
        sourcemap: true,
      },
    ],
    plugins: [
      resolve({
        browser: true,
      }),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: true,
        declarationDir: './dist',
        declarationMap: false,
      }),
    ],
  },
  // Minified UMD build
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/rate-compare.umd.min.js',
      format: 'umd',
      name: 'RateCompare',
      sourcemap: true,
    },
    plugins: [
      resolve({
        browser: true,
      }),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: false,
      }),
      terser({
        compress: {
          drop_console: true,
        },
      }),
    ],
  },
  // ESM build for modern browsers
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/rate-compare.esm.js',
      format: 'esm',
      sourcemap: true,
    },
    plugins: [
      resolve({
        browser: true,
      }),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: false,
      }),
    ],
  },
];
