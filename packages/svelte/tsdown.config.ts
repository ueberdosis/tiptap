import { transformSync } from 'esbuild'
import { readFileSync } from 'node:fs'
import { compile, compileModule } from 'svelte/compiler'
import { type UserConfig, defineConfig } from 'tsdown'

const svelteModuleRegex = /\.svelte(\.[^./\\]+)*\.(js|ts)$/

const sveltePlugin = () => ({
  name: 'svelte',

  async load(id: string) {
    // Intercept .svelte components and .svelte.ts runes modules
    // before rolldown tries to parse them as JS
    if (!id.endsWith('.svelte') && !svelteModuleRegex.test(id)) {
      return null
    }

    const source = readFileSync(id, 'utf-8')

    if (svelteModuleRegex.test(id)) {
      // .svelte.ts / .svelte.js — strip TS types, then compileModule
      const stripped = transformSync(source, {
        loader: 'ts',
        sourcemap: false,
      })

      const compiled = compileModule(stripped.code, {
        filename: id,
        dev: false,
        generate: 'client',
      })

      return {
        code: compiled.js.code,
        map: compiled.js.map,
        moduleType: 'js',
      }
    }

    // .svelte component — standard compile (handles <script lang="ts"> natively)
    const compiled = compile(source, {
      filename: id,
      dev: false,
      generate: 'client',
      css: 'injected',
    })

    return {
      code: compiled.js.code,
      map: compiled.js.map,
      moduleType: 'js',
    }
  },
})

const entries = ['src/components/menus/index.ts', 'src/index.ts']

export default defineConfig([
  ...entries.map<UserConfig>(entry => ({
    entry: [entry],
    tsconfig: '../../tsconfig.build.json',
    outDir: `dist/${entry.replace('src/', '').replace('components/', '').split('/').slice(0, -1).join('/')}`,
    dts: true,
    sourcemap: true,
    format: 'esm',
    deps: {
      neverBundle: [/^[^./]/],
    },
    plugins: [sveltePlugin()],
  })),
  ...entries.map<UserConfig>(entry => ({
    entry: [entry],
    tsconfig: '../../tsconfig.build.json',
    outDir: `dist/${entry.replace('src/', '').replace('components/', '').split('/').slice(0, -1).join('/')}`,
    dts: false,
    sourcemap: true,
    format: 'cjs',
    deps: {
      neverBundle: [/^[^./]/],
    },
    plugins: [sveltePlugin()],
  })),
])
