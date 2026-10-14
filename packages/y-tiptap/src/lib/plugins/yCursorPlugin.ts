import type { CursorAwarenessState } from '../../types/CursorAwarenessState.js'
import type { EditorState } from 'prosemirror-state'
import type { EditorView } from 'prosemirror-view'
import type { CursorUser } from '../../types/CursorUser.js'
import type { CursorPluginOptions } from '../../types/CursorPluginOptions.js'
import * as Y from 'yjs'
import { Decoration, DecorationSet } from 'prosemirror-view'
import { Plugin } from 'prosemirror-state'
import { Awareness } from 'y-protocols/awareness'
import { absolutePositionToRelativePosition } from '../utils/positions/absolutePositionToRelativePosition.js'
import { isStructuralTransaction } from '../utils/positions/isStructuralTransaction.js'
import { relativePositionToAbsolutePosition } from '../utils/positions/relativePositionToAbsolutePosition.js'
import { setMeta } from './setMeta.js'
import { yCursorPluginKey, ySyncPluginKey } from './keys.js'
import * as math from 'lib0/math'
export const defaultAwarenessStateFilter = (
  currentClientId: number,
  userClientId: number,
  _user: Record<string, unknown>,
) => currentClientId !== userClientId
/** Creates the default remote cursor element from awareness user details. */
export const defaultCursorBuilder = (user: CursorUser) => {
  const cursor = document.createElement('span')

  cursor.classList.add('ProseMirror-yjs-cursor')
  cursor.setAttribute('style', `border-color: ${user.color}`)

  const userDiv = document.createElement('div')

  userDiv.setAttribute('style', `background-color: ${user.color}`)
  userDiv.insertBefore(document.createTextNode(user.name), null)

  const nonbreakingSpace1 = document.createTextNode('\u2060')
  const nonbreakingSpace2 = document.createTextNode('\u2060')

  cursor.insertBefore(nonbreakingSpace1, null)
  cursor.insertBefore(userDiv, null)
  cursor.insertBefore(nonbreakingSpace2, null)

  return cursor
}
/** Creates the default decoration attributes for a remote selection. */
export const defaultSelectionBuilder = (user: CursorUser) => {
  return {
    style: `background-color: ${user.color}70`,
    class: 'ProseMirror-yjs-selection',
  }
}
const rxValidColor = /^#[0-9a-fA-F]{6}$/
const hasCursorUser = (user: Partial<CursorUser>): user is CursorUser =>
  typeof user.name === 'string' && typeof user.color === 'string'
export const createDecorations = (
  state: EditorState,
  awareness: Awareness,
  awarenessFilter: NonNullable<CursorPluginOptions['awarenessStateFilter']>,
  createCursor: (user: CursorUser, clientId: number) => Element,
  createSelection: NonNullable<CursorPluginOptions['selectionBuilder']>,
): DecorationSet => {
  const ystate = ySyncPluginKey.getState(state)

  if (ystate == null || ystate.doc == null || ystate.binding == null) {
    return DecorationSet.create(state.doc, [])
  }

  const y = ystate.doc
  const decorations: Decoration[] = []

  if (ystate.snapshot != null || ystate.prevSnapshot != null || ystate.binding.mapping.size === 0) {
    return DecorationSet.create(state.doc, [])
  }

  awareness.getStates().forEach((aw: CursorAwarenessState, clientId) => {
    if (!awarenessFilter(y.clientID, clientId, aw)) {
      return
    }

    if (aw && aw.cursor != null) {
      const user = { ...aw.user }

      if (user.color == null) {
        user.color = '#ffa500'
      } else if (!rxValidColor.test(user.color)) {
        console.warn('A user uses an unsupported color format', user)
      }

      if (user.name == null) {
        user.name = `User: ${clientId}`
      }

      if (!hasCursorUser(user)) {
        return
      }

      let anchor = relativePositionToAbsolutePosition(
        y,
        ystate.type,
        Y.createRelativePositionFromJSON(aw.cursor.anchor),
        ystate.binding.mapping,
      )
      let head = relativePositionToAbsolutePosition(
        y,
        ystate.type,
        Y.createRelativePositionFromJSON(aw.cursor.head),
        ystate.binding.mapping,
      )

      if (anchor !== null && head !== null) {
        const maxsize = math.max(state.doc.content.size - 1, 0)

        anchor = math.min(anchor, maxsize)
        head = math.min(head, maxsize)
        decorations.push(
          Decoration.widget(head, () => createCursor(user, clientId), {
            key: clientId + '',
            side: 10,
          }),
        )

        const from = math.min(anchor, head)
        const to = math.max(anchor, head)

        decorations.push(
          Decoration.inline(from, to, createSelection(user, clientId), {
            inclusiveEnd: true,
            inclusiveStart: false,
          }),
        )
      }
    }
  })

  return DecorationSet.create(state.doc, decorations)
}
/** Renders remote cursors and publishes the local selection through awareness. */
export const yCursorPlugin = (
  awareness: Awareness,
  {
    awarenessStateFilter = defaultAwarenessStateFilter,
    cursorBuilder = defaultCursorBuilder,
    selectionBuilder = defaultSelectionBuilder,
    getSelection = state => state.selection,
  }: CursorPluginOptions = {},
  cursorStateField: string = 'cursor',
): Plugin<DecorationSet> =>
  new Plugin<DecorationSet>({
    key: yCursorPluginKey,
    state: {
      init(_, state) {
        return createDecorations(
          state,
          awareness,
          awarenessStateFilter,
          cursorBuilder,
          selectionBuilder,
        )
      },
      apply(tr, prevState, oldState, newState) {
        const ystate = ySyncPluginKey.getState(newState)
        const yCursorState = tr.getMeta(yCursorPluginKey)
        const isRemoteChange = ystate && ystate.isChangeOrigin

        if (tr.docChanged && !isRemoteChange && isStructuralTransaction(tr, oldState.doc)) {
          return DecorationSet.empty
        }

        if (isRemoteChange || (yCursorState && yCursorState.awarenessUpdated)) {
          return createDecorations(
            newState,
            awareness,
            awarenessStateFilter,
            cursorBuilder,
            selectionBuilder,
          )
        }

        if (tr.docChanged) {
          return prevState.map(tr.mapping, tr.doc)
        }

        return prevState
      },
    },
    props: {
      decorations: state => {
        return yCursorPluginKey.getState(state) ?? DecorationSet.empty
      },
    },
    view: view => {
      const awarenessListener = () => {
        if (!view.isDestroyed) {
          setMeta(view, yCursorPluginKey, { awarenessUpdated: true })
        }
      }
      const updateCursorInfo = (editorView: EditorView) => {
        const ystate = ySyncPluginKey.getState(editorView.state)

        if (!ystate || !ystate.binding || ystate.binding.projectionError !== null) {
          return
        }

        const current: CursorAwarenessState = awareness.getLocalState() || {}

        if (editorView.hasFocus()) {
          const selection = getSelection(editorView.state)
          const anchor: Y.RelativePosition = absolutePositionToRelativePosition(
            selection.anchor,
            ystate.type,
            ystate.binding.mapping,
          )
          const head: Y.RelativePosition = absolutePositionToRelativePosition(
            selection.head,
            ystate.type,
            ystate.binding.mapping,
          )

          if (
            current.cursor == null ||
            !Y.compareRelativePositions(
              Y.createRelativePositionFromJSON(current.cursor.anchor),
              anchor,
            ) ||
            !Y.compareRelativePositions(Y.createRelativePositionFromJSON(current.cursor.head), head)
          ) {
            awareness.setLocalStateField(cursorStateField, {
              anchor,
              head,
            })
          }
        } else if (
          current.cursor != null &&
          relativePositionToAbsolutePosition(
            ystate.doc,
            ystate.type,
            Y.createRelativePositionFromJSON(current.cursor.anchor),
            ystate.binding.mapping,
          ) !== null
        ) {
          awareness.setLocalStateField(cursorStateField, null)
        }
      }
      const onFocusChange = () => updateCursorInfo(view)

      awareness.on('change', awarenessListener)
      view.dom.addEventListener('focusin', onFocusChange)
      view.dom.addEventListener('focusout', onFocusChange)

      return {
        update: updateCursorInfo,
        destroy: () => {
          view.dom.removeEventListener('focusin', onFocusChange)
          view.dom.removeEventListener('focusout', onFocusChange)
          awareness.off('change', awarenessListener)
          awareness.setLocalStateField(cursorStateField, null)
        },
      }
    },
  })
