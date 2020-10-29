import { Editor as CoreEditor } from '@tiptap/core'
import Renderer from './src/Renderer'
import VueRenderer from './src/VueRenderer'

export * from '@tiptap/core'
export { Renderer }
export { VueRenderer }
export { default as EditorContent } from './src/components/EditorContent'

export class Editor extends CoreEditor {
  renderer = Renderer
}
