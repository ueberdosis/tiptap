import type { Editor } from '@tiptap/core'
import { Fragment, Slice } from '@tiptap/pm/model'
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
      clipboardTextParser: (text, $context, plainText) => {
        if (plainText || !isEnabled() || !editor.markdown) {
          return null
        }

        try {
          const json = editor.markdown.parse(text)

          if (!json.content?.length) {
            return null
          }

          const { content } = editor.schema.nodeFromJSON(json)
          const paragraph = content.firstChild

          if (content.childCount !== 1 || paragraph?.type.name !== 'paragraph') {
            return new Slice(content, 0, 0)
          }

          // Inherit the marks at the insertion point, like a plain text paste
          const contextMarks = $context.marks()
          const inlineContent = Fragment.fromArray(
            paragraph.children.map(child =>
              child.mark(contextMarks.reduce((set, mark) => mark.addToSet(set), child.marks)),
            ),
          )

          // Open a lone paragraph so it merges into the current text
          return new Slice(Fragment.from(paragraph.copy(inlineContent)), 1, 1)
        } catch {
          // Fall back to the default plain text paste
          return null
        }
      },
    },
  })
}
