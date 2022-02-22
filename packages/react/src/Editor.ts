import { Editor as CoreEditor } from '@tiptap/core'
import { ReactRenderer } from './ReactRenderer'

export class Editor extends CoreEditor {
  public setRenderers?: React.Dispatch<React.SetStateAction<Record<string, ReactRenderer<unknown, unknown>>>>
}