import { createRollupConfig } from '@tiptap-shared/rollup-config'

import pkg from './package.json' assert { type: 'json' }

export default createRollupConfig({ input: 'src/index.ts', pkg })
