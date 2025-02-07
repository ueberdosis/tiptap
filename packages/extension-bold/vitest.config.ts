import type { UserConfig } from 'vite'
import { mergeConfig } from 'vitest/config'

import defaultConfig from '../../vitest.config'

export default mergeConfig(defaultConfig, {
  test: {
    environment: 'jsdom',
    include: ['**/*.{test,spec}.{js,ts,jsx,tsx}'],
  },
}) satisfies UserConfig
