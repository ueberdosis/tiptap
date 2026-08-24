import { defineConfig } from 'vite-plus'
import { basePackConfig, tsupCompatibleExtensions } from '../../pack.config.mjs'

/** Keep in sync with the `exports` map in package.json. */
const subExports = [
  'code-block-lowlight',
  'details',
  'drag-handle',
  'drag-handle/react',
  'drag-handle/vue',
  'embeds/twitch',
  'embeds/youtube',
  'emoji',
  'emoji/data',
  'file-handler',
  'find-and-replace',
  'highlight',
  'invisible-characters',
  'mathematics',
  'media/audio',
  'mention',
  'node-range',
  'ruby-text',
  'subscript',
  'suggestion',
  'superscript',
  'table-of-contents',
  'text-align',
  'typography',
  'unique-id',
]

// One config per subpath: sharing a config collapses the declaration file names,
// because dts output is named from the entry basename.
export default defineConfig({
  pack: subExports.map((subpath, index) => ({
    ...basePackConfig(),
    entry: [`src/${subpath}/index.ts`],
    outDir: `dist/${subpath}`,
    clean: index === 0,
    // self-references and third-party deps stay external so nothing is duplicated
    deps: { neverBundle: [/^[^./]/] },
    outExtensions: tsupCompatibleExtensions,
  })),
})
