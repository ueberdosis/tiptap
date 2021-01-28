import { canSplit } from 'prosemirror-transform'
import { ContentMatch, Fragment } from 'prosemirror-model'
import { EditorState, NodeSelection, TextSelection } from 'prosemirror-state'
import { Command } from '../types'

function defaultBlockAt(match: ContentMatch) {
  for (let i = 0; i < match.edgeCount; i + 1) {
    const { type } = match.edge(i)

    if (type.isTextblock && !type.hasRequiredAttrs()) {
      return type
    }
  }
  return null
}

export interface SplitBlockOptions {
  withMarks: boolean,
}

function keepMarks(state: EditorState) {
  const marks = state.storedMarks
    || (state.selection.$to.parentOffset && state.selection.$from.marks())

  if (marks) {
    state.tr.ensureMarks(marks)
  }
}

/**
 * Forks a new node from an existing node.
 */
export const splitBlock = (options: Partial<SplitBlockOptions> = {}): Command => ({
  tr,
  state,
  dispatch,
  editor,
}) => {
  const defaultOptions: SplitBlockOptions = {
    withMarks: true,
  }
  const config = { ...defaultOptions, ...options }
  const { selection, doc } = tr
  const { $from, $to } = selection

  const extensionAttributes = editor.extensionManager.attributes
    .filter(item => item.type === $from.node().type.name)

  const currentAttributes = $from.node().attrs
  const newAttributes = Object.fromEntries(Object
    .entries(currentAttributes)
    .filter(([name]) => {
      const extensionAttribute = extensionAttributes.find(item => item.name === name)

      if (!extensionAttribute) {
        return false
      }

      return extensionAttribute.attribute.keepOnSplit
    }))

  if (selection instanceof NodeSelection && selection.node.isBlock) {
    if (!$from.parentOffset || !canSplit(doc, $from.pos)) {
      return false
    }

    if (dispatch) {
      if (config.withMarks) {
        keepMarks(state)
      }

      tr.split($from.pos).scrollIntoView()
    }

    return true
  }

  if (!$from.parent.isBlock) {
    return false
  }

  if (dispatch) {
    const atEnd = $to.parentOffset === $to.parent.content.size

    if (selection instanceof TextSelection) {
      tr.deleteSelection()
    }

    const deflt = $from.depth === 0
      ? undefined
      : defaultBlockAt($from.node(-1).contentMatchAt($from.indexAfter(-1)))

    let types = atEnd && deflt
      ? [{
        type: deflt,
        attrs: newAttributes,
      }]
      : undefined

    let can = canSplit(tr.doc, tr.mapping.map($from.pos), 1, types)

    if (
      !types
      && !can
      && canSplit(tr.doc, tr.mapping.map($from.pos), 1, deflt ? [{ type: deflt }] : undefined)
    ) {
      can = true
      types = deflt
        ? [{
          type: deflt,
          attrs: newAttributes,
        }]
        : undefined
    }

    if (can) {
      tr.split(tr.mapping.map($from.pos), 1, types)

      if (
        !atEnd
        && !$from.parentOffset
        && $from.parent.type !== deflt
        && $from.node(-1).canReplace($from.index(-1), $from.indexAfter(-1), Fragment.from(deflt?.create()))
      ) {
        tr.setNodeMarkup(tr.mapping.map($from.before()), deflt || undefined)
      }
    }

    if (config.withMarks) {
      keepMarks(state)
    }

    tr.scrollIntoView()
  }

  return true
}
