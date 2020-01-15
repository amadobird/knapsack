import { createRollupConfig } from '@knapsack/build-tools/dist/create-rollup-config';
// import pkg from './package.json';

export default createRollupConfig({
  input: {
    'ks-design-system': './src/index.ts',
  },
  cssOutputFile: './dist/ks-design-system.css',
  distDir: './dist',
  globals: {
    react: 'React',
  },
  watchIncludes: ['./src/**', './src/**/*.scss'],
});
