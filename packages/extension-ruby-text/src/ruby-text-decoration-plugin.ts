import type { Mark, MarkType, Node as ProseMirrorNode } from '@tiptap/pm/model'
import { Plugin, PluginKey, TextSelection } from '@tiptap/pm/state'
import { Decoration, DecorationSet, type EditorView } from '@tiptap/pm/view'

const rubyTextDecorationPluginKey = new PluginKey('rubyTextDecoration')

interface RubyTextRange {
  from: number
  to: number
  mark: Mark
}

function createRtElement(
  annotation: string,
  range: RubyTextRange,
  rubyTextType: MarkType,
  view: EditorView,
  allowClickToEdit: boolean,
) {
  const rt = document.createElement('rt')
  rt.contentEditable = 'false'
  rt.textContent = annotation
  let editing = false

  const restoreEditorFocus = () => {
    view.dispatch(view.state.tr.setSelection(TextSelection.create(view.state.doc, range.to)))
    view.focus()
  }

  if (!allowClickToEdit) {
    return rt
  }

  rt.addEventListener('click', () => {
    if (editing) {
      return
    }

    editing = true

    const input = document.createElement('input')
    input.type = 'text'
    input.value = annotation
    input.size = Math.max(annotation.length, 1)
    input.setAttribute('aria-label', 'Ruby text annotation')

    const cancel = () => {
      if (!editing) {
        return
      }

      editing = false
      rt.textContent = annotation
      restoreEditorFocus()
    }

    input.addEventListener('blur', cancel)
    input.addEventListener('keydown', event => {
      if (event.key === 'Escape') {
        event.preventDefault()
        cancel()
      }

      if (event.key === 'Enter') {
        event.preventDefault()
        editing = false
        const transaction = view.state.tr.addMark(
          range.from,
          range.to,
          rubyTextType.create({ ...range.mark.attrs, rt: input.value }),
        )

        view.dispatch(transaction.setSelection(TextSelection.create(transaction.doc, range.to)))
        view.focus()
      }
    })

    rt.replaceChildren(input)
    input.focus()
    input.select()
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

function createDecorations(
  doc: ProseMirrorNode,
  rubyTextType: MarkType,
  allowClickToEdit: boolean,
) {
  const decorations = getRubyTextRanges(doc, rubyTextType).map(range => {
    const annotation = range.mark.attrs.rt ?? ''

    return Decoration.widget(
      range.to,
      view => createRtElement(annotation, range, rubyTextType, view, allowClickToEdit),
      {
        key: `ruby-text-${range.from}-${range.to}-${annotation}`,
        marks: [range.mark],
        side: 1,
        stopEvent: event =>
          allowClickToEdit &&
          [
            'click',
            'input',
            'keydown',
            'keyup',
            'mousedown',
            'mouseup',
            'pointerdown',
            'pointerup',
            'touchstart',
            'touchend',
          ].includes(event.type),
      },
    )
  })

  return DecorationSet.create(doc, decorations)
}

export function RubyTextDecorationPlugin(rubyTextType: MarkType, allowClickToEdit: boolean) {
  return new Plugin({
    key: rubyTextDecorationPluginKey,
    state: {
      init: (_, state) => createDecorations(state.doc, rubyTextType, allowClickToEdit),
      apply: (transaction, decorations) =>
        transaction.docChanged
          ? createDecorations(transaction.doc, rubyTextType, allowClickToEdit)
          : decorations.map(transaction.mapping, transaction.doc),
    },
    props: {
      decorations: state => rubyTextDecorationPluginKey.getState(state),
    },
  })
}
