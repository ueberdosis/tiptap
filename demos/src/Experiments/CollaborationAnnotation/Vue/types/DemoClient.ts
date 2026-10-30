import type { Editor } from '@tiptap/vue'
import type { Doc } from 'yjs'
import type { ResolvedAnnotation } from '../extension/types/Annotation.js'

export interface DemoClient {
  name: string
  document: Doc
  editor: Editor
  annotations: ResolvedAnnotation[]
  stored: string
  content: string
}
