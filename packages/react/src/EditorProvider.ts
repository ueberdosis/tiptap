import { Editor } from '@tiptap/react'
import { createContext } from 'react'

export const EditorContext = createContext<Editor | null>(null)

const { Provider, Consumer } = EditorContext

export {
  Provider as EditorProvider,
  Consumer as EditorConsumer,
}
