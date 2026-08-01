/**
 * Shared output extension mapping that matches tsup's naming so the
 * published package.json fields (main/module/types/exports) keep working.
 *
 * tsup emits `index.js`/`index.d.ts` for ESM and `index.cjs`/`index.d.cts`
 * for CJS. tsdown defaults to `.mjs`/`.d.mts`, so we override it here.
 */
export const tsupCompatibleExtensions = ({ format }: { format: string }) => {
  if (format === 'es') {
    return { js: '.js', dts: '.d.ts' }
  }
  return { js: '.cjs', dts: '.d.cts' }
}

/**
 * Base pack config for a single-entry package, matching the old tsup config.
 */
export const basePackConfig = () => ({
  tsconfig: '../../tsconfig.build.json',
  outDir: 'dist',
  dts: true,
  clean: true,
  sourcemap: true,
  format: ['esm', 'cjs'],
  outExtensions: tsupCompatibleExtensions,
})
