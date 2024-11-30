import babel from '@rollup/plugin-babel'
import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'
import autoExternal from 'rollup-plugin-auto-external'
import sourcemaps from 'rollup-plugin-sourcemaps'
import typescript from 'rollup-plugin-typescript2'

export const baseConfig = ({
  input = 'src/index.ts',
  pkg,
}) => ({
  external: [/@tiptap\/pm\/.*/],
  input,
  output: [
    {
      name: pkg.name,
      file: pkg.umd,
      format: 'umd',
      sourcemap: true,
      exports: 'named',
    },
    {
      name: pkg.name,
      file: pkg.main,
      format: 'cjs',
      interop: 'compat',
      sourcemap: true,
      exports: 'named',
    },
    {
      name: pkg.name,
      file: pkg.module,
      format: 'es',
      sourcemap: true,
      exports: 'named',
    },
  ],
  plugins: [
    autoExternal({
      packagePath: './package.json',
    }),
    sourcemaps(),
    resolve(),
    commonjs(),
    babel({
      babelHelpers: 'bundled',
      exclude: '../../node_modules/**',
    }),
    typescript({
      tsconfig: '../../tsconfig.json',
      tsconfigOverride: {
        compilerOptions: {
          declaration: true,
          rootDir: `./packages/${pkg.name.split('/')[1]}/src`,
          declarationMap: true,
          paths: {
            '@tiptap/*': ['packages/*/dist', 'packages/*/src'],
          },
          noEmit: false,
        },
        include: null,
      },
    }),
  ],
})
