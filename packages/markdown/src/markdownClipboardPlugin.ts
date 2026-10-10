import type { Editor } from '@tiptap/core'
import { Slice } from '@tiptap/pm/model'
import { Plugin, PluginKey } from '@tiptap/pm/state'

export const markdownClipboardPluginKey = new PluginKey('markdownClipboard')

/**
 * Parses pasted plain text as markdown.
 * Only runs when the clipboard has no HTML, so rich pastes are left alone.
 */
export function createMarkdownClipboardPlugin(editor: Editor, isEnabled: () => boolean): Plugin {
  return new Plugin({
    key: markdownClipboardPluginKey,
    props: {
      clipboardTextParser: (text, _context, plainText) => {
        if (plainText || !isEnabled() || !editor.markdown) {
          return null
        }

        try {
          const json = editor.markdown.parse(text)

          if (!json.content?.length) {
            return null
          }

          const { content } = editor.schema.nodeFromJSON(json)
          const isSingleParagraph =
            content.childCount === 1 && content.firstChild?.type.name === 'paragraph'

          // Open a lone paragraph so it merges into the current text
          return isSingleParagraph ? new Slice(content, 1, 1) : new Slice(content, 0, 0)
        } catch {
          // Fall back to the default plain text paste
          return null
        }
      },
    },
  })
}
