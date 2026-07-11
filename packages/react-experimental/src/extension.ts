import { Extension } from '@tiptap/core'

import { beforeInput } from './plugins/beforeInput.js'
import { composition } from './plugins/composition.js'
import { reactKeys } from './plugins/reactKeys.js'

/**
 * The ProseMirror plugins the React renderer needs inside the editor state.
 * `useEditor` / `createRendererEditor` add this automatically.
 */
export const ReactRendererExtension = Extension.create({
  name: 'reactRenderer',

  addProseMirrorPlugins() {
    return [reactKeys(), composition(), beforeInput()]
  },
})
