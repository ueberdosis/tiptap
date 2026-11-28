import type { Editor } from '@tiptap/core'
import { Fragment, type ResolvedPos, Slice } from '@tiptap/pm/model'
import { Plugin, PluginKey } from '@tiptap/pm/state'

import { defaultShouldTransformPastedText } from './defaultShouldTransformPastedText.js'
import type { MarkdownExtensionOptions } from './Extension.js'

const markdownClipboardPluginKey = new PluginKey('markdownClipboard')

type PasteState = 'idle' | 'pasting' | 'parsed'

type ClipboardOptions = Pick<
  MarkdownExtensionOptions,
  'transformPastedText' | 'shouldTransformPastedText'
>

function shouldTransformText(
  editor: Editor,
  text: string,
  shouldTransformPastedText: ClipboardOptions['shouldTransformPastedText'],
): boolean {
  const tokens = editor.markdown!.instance.lexer(text)
  const defaultShouldTransform = defaultShouldTransformPastedText(tokens)

  if (!shouldTransformPastedText) {
    return defaultShouldTransform
  }

  return shouldTransformPastedText(text, { tokens, editor, defaultShouldTransform })
}

function createSlice(content: Fragment, $context: ResolvedPos): Slice {
  const paragraph = content.firstChild

  if (content.childCount !== 1 || paragraph?.type.name !== 'paragraph') {
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
  return new Slice(Fragment.from(paragraph.copy(inlineContent)), 1, 1)
}

// ProseMirror re-opens parsed slices, so restore the closed blocks unless a transform broke them
function closeSlice(slice: Slice): Slice {
  try {
    slice.content.forEach(node => node.check())
  } catch {
    return slice
  }

  return new Slice(slice.content, 0, 0)
}

function parseMarkdownSlice(
  editor: Editor,
  text: string,
  $context: ResolvedPos,
  shouldTransformPastedText: ClipboardOptions['shouldTransformPastedText'],
): Slice | null {
  if (!shouldTransformText(editor, text, shouldTransformPastedText)) {
    return null
  }

  const json = editor.markdown!.parse(text)

  if (!json.content?.length) {
    return null
  }

  return createSlice(editor.schema.nodeFromJSON(json).content, $context)
}

/**
 * Parses pasted plain text as markdown.
 * Only runs when the clipboard has no HTML, so rich pastes are left alone.
 */
export function createMarkdownClipboardPlugin(
  editor: Editor,
  getOptions: () => ClipboardOptions,
): Plugin {
  let state: PasteState = 'idle'
  let parsedClosed = false
  let pasteEvent: Event | null = null

  return new Plugin({
    key: markdownClipboardPluginKey,
    props: {
      clipboardTextParser: (text, $context, plainText) => {
        const { transformPastedText, shouldTransformPastedText } = getOptions()

        if (state !== 'pasting' || plainText || !transformPastedText || !editor.markdown) {
          return null
        }

        try {
          const slice = parseMarkdownSlice(editor, text, $context, shouldTransformPastedText)

          if (slice) {
            parsedClosed = slice.openStart === 0 && slice.openEnd === 0
            state = 'parsed'
          }

          return slice
        } catch {
          // Fall back to the default plain text paste
          return null
        }
      },

      // Dispatch without the uiEvent meta so paste rules don't convert the text again
      handlePaste: (view, event, receivedSlice) => {
        // Programmatic pastes create a new event, so a stale slice never matches
        const wasParsed = state === 'parsed' && event === pasteEvent
        const closed = parsedClosed

        state = 'idle'
        parsedClosed = false
        pasteEvent = null

        const html = (event as ClipboardEvent).clipboardData?.getData('text/html')

        if (!wasParsed || html) {
          return false
        }

        const slice = closed ? closeSlice(receivedSlice) : receivedSlice

        // Our handler short-circuits the core paste handler that normally emits this
        editor.emit('paste', { editor, event, slice })

        view.dispatch(view.state.tr.replaceSelection(slice).setMeta('paste', true).scrollIntoView())

        return true
      },

      handleDOMEvents: {
        paste: (_view, event) => {
          state = 'pasting'
          parsedClosed = false
          pasteEvent = event

          return false
        },

        // Drops run the text parser too, but must stay plain text
        drop: () => {
          state = 'idle'
          parsedClosed = false
          pasteEvent = null

          return false
        },
      },
    },
  })
}
