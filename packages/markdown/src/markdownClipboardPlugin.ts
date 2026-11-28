import { defaultBlockAt, type Editor, isAndroid, selectionToInsertionEnd } from '@tiptap/core'
import { Fragment, type ResolvedPos, Slice } from '@tiptap/pm/model'
import { Plugin, PluginKey, TextSelection, type Transaction } from '@tiptap/pm/state'
import { handlePaste as handleTablePaste } from '@tiptap/pm/tables'
import type { EditorView } from '@tiptap/pm/view'

import { defaultShouldTransformPastedText } from './defaultShouldTransformPastedText.js'
import type { MarkdownExtensionOptions } from './Extension.js'
import { splitSoftBreaks } from './splitSoftBreaks.js'

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

// Files and VS Code pastes have their own handlers, and edits can't happen when read-only or composing
function shouldSkipPaste(view: EditorView, event: ClipboardEvent): boolean {
  const { clipboardData } = event

  return (
    !view.editable ||
    (view.composing && !isAndroid()) ||
    !!clipboardData?.files?.length ||
    !!clipboardData?.getData('vscode-editor-data')
  )
}

function createSlice(content: Fragment, $context: ResolvedPos, text: string): Slice {
  const paragraph = content.firstChild

  if (!paragraph || content.content.some(child => child.type.name !== 'paragraph')) {
    return new Slice(splitSoftBreaks(content), 0, 0)
  }

  // Inherit the marks at the insertion point, like a plain text paste
  const contextMarks = $context.marks()
  const lines = splitSoftBreaks(content).content.map(line =>
    line.copy(
      Fragment.fromArray(
        line.children.map(child =>
          child.mark(child.marks.reduce((set, mark) => mark.addToSet(set), contextMarks)),
        ),
      ),
    ),
  )

  // Like a plain text paste, an edge newline splits the line
  if (/^(?:\r\n?|\n)/.test(text)) {
    lines.unshift(paragraph.type.create())
  }

  if (/(?:\r\n?|\n)$/.test(text)) {
    lines.push(paragraph.type.create())
  }

  // Open paragraph-only content so its edges merge into the current text
  return new Slice(Fragment.fromArray(lines), 1, 1)
}

// A block leaf at the end of the paste has no place for the caret, so move it below the leaf
function placeCaretAfterBlockLeaf(tr: Transaction): Transaction {
  let end = 0

  tr.mapping.maps.at(-1)?.forEach((_from, _to, _newFrom, newTo) => {
    end = Math.max(end, newTo)
  })

  const $end = tr.doc.resolve(end)

  if (!$end.nodeBefore?.isBlock || !$end.nodeBefore.isLeaf) {
    return tr
  }

  if ($end.nodeAfter?.isTextblock) {
    return tr.setSelection(TextSelection.create(tr.doc, $end.pos + 1))
  }

  const node = defaultBlockAt($end.parent.contentMatchAt($end.index()))?.createAndFill()

  if (!node || !$end.parent.canReplaceWith($end.index(), $end.index(), node.type)) {
    return tr
  }

  tr.insert($end.pos, node)
  selectionToInsertionEnd(tr, tr.steps.length - 1, -1)

  return tr
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
  // Code excludes other marks, so converting would drop the markdown syntax
  if ($context.marks().some(mark => mark.type.spec.code)) {
    return null
  }

  if (!shouldTransformText(editor, text, shouldTransformPastedText)) {
    return null
  }

  const json = editor.markdown!.parse(text, { implicitEmptyParagraphs: false })

  if (!json.content?.length) {
    return null
  }

  return createSlice(editor.schema.nodeFromJSON(json).content, $context, text)
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

      // The paste handlers get closed blocks, unless a transform broke them
      transformPasted: slice => {
        // Consume the flag so it can't close a later paste
        const closed = state === 'parsed' && parsedClosed

        parsedClosed = false

        return closed ? closeSlice(slice) : slice
      },

      // Dispatch without the uiEvent meta so paste rules don't convert the text again
      handlePaste: (view, event, slice) => {
        // Programmatic pastes create a new event, so a stale slice never matches
        const wasParsed = state === 'parsed' && event === pasteEvent

        state = 'idle'
        parsedClosed = false
        pasteEvent = null

        const html = (event as ClipboardEvent).clipboardData?.getData('text/html')

        if (!wasParsed || html) {
          return false
        }

        // Our handler runs before the table plugin, so let it fill the selected cells
        if (handleTablePaste(view, event, slice)) {
          return true
        }

        // Our handler short-circuits the core paste handler that normally emits this
        editor.emit('paste', { editor, event, slice })

        const tr = view.state.tr.replaceSelection(slice).setMeta('paste', true).scrollIntoView()

        view.dispatch(placeCaretAfterBlockLeaf(tr))

        return true
      },

      handleDOMEvents: {
        paste: (view, event) => {
          if (shouldSkipPaste(view, event as ClipboardEvent)) {
            state = 'idle'
            parsedClosed = false
            pasteEvent = null

            return false
          }

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
