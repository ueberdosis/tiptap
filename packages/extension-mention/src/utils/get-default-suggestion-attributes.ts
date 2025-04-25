import type { Editor } from '@tiptap/core'
import { PluginKey } from '@tiptap/pm/state'
import type { SuggestionOptions } from '@tiptap/suggestion'

export interface GetSuggestionOptionsOptions {
  editor: Editor
  overrideSuggestionOptions: Omit<SuggestionOptions, 'editor'>
  extensionName: string
  char?: string
}

export function getSuggestionOptions({
  editor: tiptapEditor,
  overrideSuggestionOptions,
  extensionName,
  char = '@',
}: GetSuggestionOptionsOptions): SuggestionOptions {
  const pluginKey = new PluginKey()

  return {
    editor: tiptapEditor,
    char,
    pluginKey,
    command: ({ editor, range, props }: { editor: any; range: any; props: any }) => {
      // increase range.to by one when the next node is of type "text"
      // and starts with a space character
      const nodeAfter = editor.view.state.selection.$to.nodeAfter
      const overrideSpace = nodeAfter?.text?.startsWith(' ')

      if (overrideSpace) {
        range.to += 1
      }

      editor
        .chain()
        .focus()
        .insertContentAt(range, [
          {
            type: extensionName,
            attrs: { ...props, mentionSuggestionChar: char },
          },
          {
            type: 'text',
            text: ' ',
          },
        ])
        .run()

      // get reference to `window` object from editor element, to support cross-frame JS usage
      editor.view.dom.ownerDocument.defaultView?.getSelection()?.collapseToEnd()
    },
    allow: ({ state, range }: { state: any; range: any }) => {
      const $from = state.doc.resolve(range.from)
      const type = state.schema.nodes[extensionName]
      const allow = !!$from.parent.type.contentMatch.matchType(type)

      return allow
    },
    ...overrideSuggestionOptions,
  }
}
