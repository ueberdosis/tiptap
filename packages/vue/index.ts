import { Editor as CoreEditor } from '@tiptap/core'
import Renderer from './src/Renderer'

export * from '@tiptap/core'
export { default as EditorContent } from './src/components/EditorContent'

export class Editor extends CoreEditor {
  renderer = Renderer
}