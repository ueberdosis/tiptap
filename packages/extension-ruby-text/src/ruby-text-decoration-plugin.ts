import type { Editor } from '@tiptap/core'
import type { Mark, MarkType, Node as ProseMirrorNode } from '@tiptap/pm/model'
import { Plugin, PluginKey, TextSelection } from '@tiptap/pm/state'
import { Decoration, DecorationSet, type EditorView } from '@tiptap/pm/view'

const rubyTextDecorationPluginKey = new PluginKey('rubyTextDecoration')

// Ends a widget's edit session on destroy, so stale submit/dismiss calls do nothing.
const editSessions = new WeakMap<Node, () => void>()

interface RubyTextRange {
  from: number
  to: number
  mark: Mark
}

export interface RubyTextAnnotationEditorProps {
  /**
   * The current annotation value (`''` when the mark has an empty annotation).
   */
  annotation: string
  /**
   * Applies the given value as the new annotation and closes the editor.
   * Calling it more than once (or after `dismiss`) is a no-op.
   */
  submit: (value: string) => void
  /**
   * Closes the editor without changing the annotation.
   * Calling it more than once (or after `submit`) is a no-op.
   */
  dismiss: () => void
  /**
   * The editor instance.
   */
  editor: Editor
}

export interface RubyTextDecorationPluginOptions {
  editor: Editor
  allowClickToEdit: boolean
  renderAnnotationEditor?: (props: RubyTextAnnotationEditorProps) => HTMLElement
}

// Enter and Escape during IME composition must not close the editor.
// Safari reports some IME keydowns only via the deprecated keyCode 229.
function isImeEvent(event: KeyboardEvent) {
  const legacyKeyCode = (event as { keyCode?: number }).keyCode
  return event.isComposing || legacyKeyCode === 229
}

/** Default annotation editor: a plain text input. Enter submits, Escape or blur dismisses. */
function defaultRenderAnnotationEditor({
  annotation,
  submit,
  dismiss,
}: RubyTextAnnotationEditorProps) {
  const input = document.createElement('input')
  input.type = 'text'
  input.value = annotation
  input.size = Math.max(annotation.length, 1)
  input.setAttribute('aria-label', 'Ruby text annotation')

  input.addEventListener('focus', () => input.select(), { once: true })
  input.addEventListener('blur', () => dismiss())
  input.addEventListener('keydown', event => {
    if (isImeEvent(event)) {
      return
    }

    if (event.key === 'Escape') {
      event.preventDefault()
      dismiss()
    }

    if (event.key === 'Enter') {
      event.preventDefault()
      submit(input.value)
    }
  })

  return input
}

function createRtElement(
  annotation: string,
  range: RubyTextRange,
  rubyTextType: MarkType,
  view: EditorView,
  options: RubyTextDecorationPluginOptions,
) {
  const rt = document.createElement('rt')
  rt.contentEditable = 'false'
  rt.textContent = annotation
  let editing = false

  const restoreEditorFocus = () => {
    view.dispatch(view.state.tr.setSelection(TextSelection.create(view.state.doc, range.to)))
    view.focus()
  }

  if (!options.allowClickToEdit || !view.editable) {
    return rt
  }

  editSessions.set(rt, () => {
    editing = false
  })

  const dismiss = () => {
    if (!editing) {
      return
    }

    editing = false
    rt.textContent = annotation
    restoreEditorFocus()
  }

  const submit = (value: string) => {
    if (!editing) {
      return
    }

    // An unchanged value produces no doc change, so the widget would not
    // re-render and the editor element would stay mounted.
    if (!view.editable || value === annotation) {
      dismiss()
      return
    }

    editing = false
    const transaction = view.state.tr.addMark(
      range.from,
      range.to,
      rubyTextType.create({ ...range.mark.attrs, rt: value }),
    )

    view.dispatch(transaction.setSelection(TextSelection.create(transaction.doc, range.to)))
    view.focus()
  }

  const openEditor = () => {
    const renderEditor = options.renderAnnotationEditor ?? defaultRenderAnnotationEditor
    const element = renderEditor({ annotation, submit, dismiss, editor: options.editor })

    rt.replaceChildren(element)

    // Browsers ignore autofocus on inserted nodes, so we focus it manually.
    const focusTarget = element.querySelector<HTMLElement>('[autofocus]') ?? element
    focusTarget.focus()
  }

  rt.addEventListener('click', () => {
    if (editing || !view.editable) {
      return
    }

    editing = true
    openEditor()
  })

  return rt
}

/** Gets the mark of ruby text from the given node, if it exists. */
function getRubyTextMark(node: ProseMirrorNode, rubyTextType: MarkType) {
  return node.isText ? node.marks.find(candidate => candidate.type === rubyTextType) : undefined
}

/** Adds a ruby text range to an existing array of ranges. */
function addRange(ranges: RubyTextRange[], range: RubyTextRange | null) {
  if (range) {
    ranges.push(range)
  }
}

/** Can the current range be extended with the given mark at the given position? */
function canExtendRange(range: RubyTextRange | null, mark: Mark, pos: number) {
  return range?.to === pos && range.mark.eq(mark)
}

/**
 * Gets the next ruby text range based on the current node and position.
 * @param ranges The array of ruby text ranges to add to.
 * @param range The current ruby text range being built.
 * @param node The current ProseMirror node being processed.
 * @param pos The position of the current node in the document.
 * @param rubyTextType The MarkType for ruby text.
 * @returns The updated ruby text range, or null if the current node does not have a ruby text mark.
 */
function getNextRange(
  ranges: RubyTextRange[],
  range: RubyTextRange | null,
  node: ProseMirrorNode,
  pos: number,
  rubyTextType: MarkType,
) {
  const mark = getRubyTextMark(node, rubyTextType)

  if (!mark) {
    addRange(ranges, range)
    return null
  }

  if (range && canExtendRange(range, mark, pos)) {
    range.to += node.nodeSize
    return range
  }

  addRange(ranges, range)
  return { from: pos, to: pos + node.nodeSize, mark }
}

function getRubyTextRanges(doc: ProseMirrorNode, rubyTextType: MarkType) {
  const ranges: RubyTextRange[] = []
  let range: RubyTextRange | null = null

  doc.descendants((node, pos) => {
    range = getNextRange(ranges, range, node, pos, rubyTextType)
  })
  addRange(ranges, range)

  return ranges
}

// Events from the annotation editor that ProseMirror must not handle itself.
const STOPPED_EVENT_TYPES = new Set([
  'click',
  'dblclick',
  'contextmenu',
  'mousedown',
  'mouseup',
  'pointerdown',
  'pointerup',
  'touchstart',
  'touchend',
  'keydown',
  'keypress',
  'keyup',
  'input',
  'beforeinput',
  'compositionstart',
  'compositionupdate',
  'compositionend',
  'paste',
  'cut',
  'copy',
  'focus',
  'blur',
  'focusin',
  'focusout',
])

function createDecorations(
  doc: ProseMirrorNode,
  rubyTextType: MarkType,
  options: RubyTextDecorationPluginOptions,
) {
  const decorations = getRubyTextRanges(doc, rubyTextType).map(range => {
    const annotation = range.mark.attrs.rt ?? ''

    return Decoration.widget(
      range.to,
      view => createRtElement(annotation, range, rubyTextType, view, options),
      {
        key: `ruby-text-${range.from}-${range.to}-${annotation}`,
        marks: [range.mark],
        side: 1,
        stopEvent: event => options.allowClickToEdit && STOPPED_EVENT_TYPES.has(event.type),
        destroy: node => editSessions.get(node)?.(),
      },
    )
  })

  return DecorationSet.create(doc, decorations)
}

export function RubyTextDecorationPlugin(
  rubyTextType: MarkType,
  options: RubyTextDecorationPluginOptions,
) {
  return new Plugin({
    key: rubyTextDecorationPluginKey,
    state: {
      init: (_, state) => createDecorations(state.doc, rubyTextType, options),
      apply: (transaction, decorations) =>
        transaction.docChanged
          ? createDecorations(transaction.doc, rubyTextType, options)
          : decorations.map(transaction.mapping, transaction.doc),
    },
    props: {
      decorations: state => rubyTextDecorationPluginKey.getState(state),
    },
  })
}
