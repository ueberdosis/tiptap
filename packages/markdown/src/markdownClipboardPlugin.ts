import type { Editor } from '@tiptap/core'
import { Fragment, Slice } from '@tiptap/pm/model'
import { Plugin, PluginKey } from '@tiptap/pm/state'

export const markdownClipboardPluginKey = new PluginKey('markdownClipboard')

/**
 * Parses pasted plain text as markdown.
 * Only runs when the clipboard has no HTML, so rich pastes are left alone.
 */
export function createMarkdownClipboardPlugin(editor: Editor, isEnabled: () => boolean): Plugin {
  // Set by clipboardTextParser, consumed by handlePaste in the same paste
  let hasMarkdownSlice = false

  return new Plugin({
    key: markdownClipboardPluginKey,
    props: {
      clipboardTextParser: (text, $context, plainText) => {
        hasMarkdownSlice = false

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
            hasMarkdownSlice = true

            return new Slice(content, 0, 0)
          }

          // Inherit the marks at the insertion point, like a plain text paste
          const contextMarks = $context.marks()
          const inlineContent = Fragment.fromArray(
            paragraph.children.map(child =>
              child.mark(child.marks.reduce((set, mark) => mark.addToSet(set), contextMarks)),
            ),
          )

          // Open a lone paragraph so it merges into the current text
          hasMarkdownSlice = true

          return new Slice(Fragment.from(paragraph.copy(inlineContent)), 1, 1)
        } catch {
          // Fall back to the default plain text paste
          return null
        }
      },

      // Dispatch without the uiEvent meta so paste rules don't convert the text again
      handlePaste: (view, event, slice) => {
        const hadMarkdownSlice = hasMarkdownSlice

        hasMarkdownSlice = false

        // A flag left by an earlier paste must not capture an HTML paste
        const html = (event as ClipboardEvent).clipboardData?.getData('text/html')

        if (!hadMarkdownSlice || html) {
          return false
        }

        // Our handler short-circuits the core paste handler that normally emits this
        editor.emit('paste', { editor, event, slice })

        view.dispatch(view.state.tr.replaceSelection(slice).setMeta('paste', true).scrollIntoView())

        return true
      },

      handleDOMEvents: {
        // Scope the flag to this paste, drops can leave it set
        paste: () => {
          hasMarkdownSlice = false

          return false
        },
      },
    },
  })
}
