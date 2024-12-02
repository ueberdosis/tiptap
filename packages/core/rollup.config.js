import { baseConfig } from '@tiptap-shared/rollup-config'

import pkg from './package.json' assert { type: 'json' }

export default [baseConfig({ input: 'src/index.ts', pkg }), baseConfig({
  input: 'src/jsx-runtime.ts',
  pkg: {
    name: '@tiptap/core/jsx-runtime',
    main: 'dist/jsx-runtime.cjs',
    module: 'dist/jsx-runtime.js',
    umd: 'dist/jsx-runtime.umd.js',
  },
})]
