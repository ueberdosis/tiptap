import type { Editor } from '@tiptap/core'
import { isChangeOrigin } from '@tiptap/extension-collaboration'
import type { Node } from '@tiptap/pm/model'
import type { EditorState, Transaction } from '@tiptap/pm/state'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import type { EditorView } from '@tiptap/pm/view'
import type { Instance, Props as TippyProps } from 'tippy.js'
import tippy from 'tippy.js'
import {
  absolutePositionToRelativePosition,
  relativePositionToAbsolutePosition,
  ySyncPluginKey,
} from 'y-prosemirror'

import { dragHandler } from './helpers/dragHandler.js'
import { findElementNextToCoords } from './helpers/findNextElementFromCursor.js'
import { getOuterNode, getOuterNodePos } from './helpers/getOuterNode.js'
import { removeNode } from './helpers/removeNode.js'

type PluginState = {
  locked: boolean
}

const getRelativePos = (state: EditorState, absolutePos: number) => {
  const ystate = ySyncPluginKey.getState(state)

  if (!ystate) {
    return null
  }

  return absolutePositionToRelativePosition(
    absolutePos,
    ystate.type,
    ystate.binding.mapping,
  )
}

const getAbsolutePos = (state: EditorState, relativePos: any) => {
  const ystate = ySyncPluginKey.getState(state)

  if (!ystate) {
    return -1
  }

  return (
    relativePositionToAbsolutePosition(
      ystate.doc,
      ystate.type,
      relativePos,
      ystate.binding.mapping,
    ) || 0
  )
}

const getOuterDomNode = (view: EditorView, domNode: HTMLElement) => {
  let tmpDomNode = domNode

  // Traverse to top level node.
  while (tmpDomNode && tmpDomNode.parentNode) {
    if (tmpDomNode.parentNode === view.dom) {
      break
    }

    tmpDomNode = tmpDomNode.parentNode as HTMLElement
  }

  return tmpDomNode
}

export interface DragHandlePluginProps {
  pluginKey?: PluginKey | string
  editor: Editor
  element: HTMLElement
  onNodeChange?: (data: {
    editor: Editor
    node: Node | null
    pos: number
  }) => void
  tippyOptions?: Partial<TippyProps>
}

export const dragHandlePluginDefaultKey = new PluginKey('dragHandle')

export const DragHandlePlugin = ({
  pluginKey = dragHandlePluginDefaultKey,
  element,
  editor,
  tippyOptions,
  onNodeChange,
}: DragHandlePluginProps) => {
  const wrapper = document.createElement('div')
  let popup: Instance | null = null
  let locked = false
  let currentNode: Node | null = null
  let currentNodePos = -1
  let currentNodeRelPos: any

  element.addEventListener('dragstart', e => {
    // Push this to the end of the event cue
    // Fixes bug where incorrect drag pos is returned if drag handle has position: absolute
    // @ts-ignore
    dragHandler(e, editor)

    setTimeout(() => {
      if (element) {
        element.style.pointerEvents = 'none'
      }
    }, 0)
  })

  element.addEventListener('dragend', () => {
    if (element) {
      element.style.pointerEvents = 'auto'
    }
  })

  return new Plugin({
    key: typeof pluginKey === 'string' ? new PluginKey(pluginKey) : pluginKey,

    state: {
      init() {
        return { locked: false }
      },
      apply(
        tr: Transaction,
        value: PluginState,
        oldState: EditorState,
        state: EditorState,
      ) {
        const isLocked = tr.getMeta('lockDragHandle')
        const hideDragHandle = tr.getMeta('hideDragHandle')

        if (isLocked !== undefined) {
          locked = isLocked
        }

        if (hideDragHandle && popup) {
          popup.hide()

          locked = false
          currentNode = null
          currentNodePos = -1

          onNodeChange?.({ editor, node: null, pos: -1 })

          return value
        }

        // Something has changed and drag handler is visible…
        if (tr.docChanged && currentNodePos !== -1 && element && popup) {
          // Yjs replaces the entire document on every incoming change and needs a special handling.
          // If change comes from another user …
          if (isChangeOrigin(tr)) {
            // https://discuss.yjs.dev/t/y-prosemirror-mapping-a-single-relative-position-when-doc-changes/851/3
            const newPos = getAbsolutePos(state, currentNodeRelPos)

            if (newPos !== currentNodePos) {
              // Set the new position for our current node.
              currentNodePos = newPos

              // We will get the outer node with data and position in views update method.
            }
          } else {
            // … otherwise use ProseMirror mapping to update the position.
            const newPos = tr.mapping.map(currentNodePos)

            if (newPos !== currentNodePos) {
              // TODO: Remove
              // console.log('Position has changed …', { old: currentNodePos, new: newPos }, tr);

              // Set the new position for our current node.
              currentNodePos = newPos

              // Memorize relative position to retrieve absolute position in case of collaboration
              currentNodeRelPos = getRelativePos(state, currentNodePos)

              // We will get the outer node with data and position in views update method.
            }
          }
        }

        return value
      },
    },

    view: view => {
      element.draggable = true
      element.style.pointerEvents = 'auto'

      editor.view.dom.parentElement?.appendChild(wrapper)

      wrapper.appendChild(element)
      wrapper.style.pointerEvents = 'none'
      wrapper.style.position = 'absolute'
      wrapper.style.top = '0'
      wrapper.style.left = '0'

      return {
        update(_, oldState) {
          if (!element) {
            return
          }

          if (!editor.isEditable) {
            popup?.destroy()
            popup = null
            return
          }

          if (!popup) {
            popup = tippy(view.dom, {
              getReferenceClientRect: null,
              interactive: true,
              trigger: 'manual',
              placement: 'left-start',
              hideOnClick: false,
              duration: 100,
              popperOptions: {
                modifiers: [
                  { name: 'flip', enabled: false },
                  {
                    name: 'preventOverflow',
                    options: {
                      rootBoundary: 'document',
                      mainAxis: false,
                    },
                  },
                ],
              },
              ...tippyOptions,
              appendTo: wrapper,
              content: element,
            })
          }

          // Prevent element being draggend while being open.
          if (locked) {
            element.draggable = false
          } else {
            element.draggable = true
          }

          // Do not close on updates (e.g. changing padding of a section or collaboration events)
          // popup?.hide();

          // Recalculate popup position if doc has changend and drag handler is visible.
          if (view.state.doc.eq(oldState.doc) || currentNodePos === -1) {
            return
          }

          // Get domNode from (new) position.
          let domNode = view.nodeDOM(currentNodePos) as HTMLElement

          // Since old element could have been wrapped, we need to find
          // the outer node and take its position and node data.
          domNode = getOuterDomNode(view, domNode)

          // Skip if domNode is editor dom.
          if (domNode === view.dom) {
            return
          }

          // We only want `Element`.
          if (domNode?.nodeType !== 1) {
            return
          }

          const domNodePos = view.posAtDOM(domNode, 0)
          const outerNode = getOuterNode(editor.state.doc, domNodePos)
          const outerNodePos = getOuterNodePos(editor.state.doc, domNodePos) // TODO: needed?

          currentNode = outerNode
          currentNodePos = outerNodePos

          // Memorize relative position to retrieve absolute position in case of collaboration
          currentNodeRelPos = getRelativePos(view.state, currentNodePos)

          // TODO: Remove
          // console.log('View has updated: callback with new data and repositioning of popup …', {
          //   domNode,
          //   currentNodePos,
          //   currentNode,
          //   rect: (domNode as Element).getBoundingClientRect(),
          // });

          onNodeChange?.({ editor, node: currentNode, pos: currentNodePos })

          // Update Tippys getReferenceClientRect since domNode might have changed.
          popup.setProps({
            getReferenceClientRect: () => (domNode as Element).getBoundingClientRect(),
          })
        },

        // TODO: Kills even on hot reload
        destroy() {
          popup?.destroy()

          if (element) {
            removeNode(wrapper)
          }
        },
      }
    },

    props: {
      handleDOMEvents: {
        keydown(view) {
          if (popup && popup.state.isVisible && view.hasFocus()) {
            popup.hide()
            return false
          }

          return false
        },

        mouseleave(_view, e) {
          // Do not hide open popup on mouseleave.
          if (locked) {
            return false
          }

          // If e.target is not inside the wrapper, hide.
          if (e.target && !wrapper.contains(e.relatedTarget as HTMLElement)) {
            popup?.hide()

            currentNode = null
            currentNodePos = -1

            onNodeChange?.({ editor, node: null, pos: -1 })
          }

          return false
        },

        mousemove(view, e) {
          // Do not continue if popup is not initialized or open.
          if (!element || !popup || locked) {
            return false
          }

          const nodeData = findElementNextToCoords({
            x: e.clientX,
            y: e.clientY,
            direction: 'right',
            editor,
          })

          // Skip if there is no node next to coords
          if (!nodeData.resultElement) {
            return false
          }

          let domNode = nodeData.resultElement as HTMLElement

          domNode = getOuterDomNode(view, domNode)

          // Skip if domNode is editor dom.
          if (domNode === view.dom) {
            return false
          }

          // We only want `Element`.
          if (domNode?.nodeType !== 1) {
            return false
          }

          const domNodePos = view.posAtDOM(domNode, 0)
          const outerNode = getOuterNode(editor.state.doc, domNodePos)

          if (outerNode !== currentNode) {
            const outerNodePos = getOuterNodePos(editor.state.doc, domNodePos)

            currentNode = outerNode
            currentNodePos = outerNodePos

            // Memorize relative position to retrieve absolute position in case of collaboration
            currentNodeRelPos = getRelativePos(view.state, currentNodePos)

            // TODO: Remove
            // console.log('Mousemove with changed node / node data …', {
            //   domNode,
            //   currentNodePos,
            //   currentNode,
            //   rect: (domNode as Element).getBoundingClientRect(),
            // });

            onNodeChange?.({ editor, node: currentNode, pos: currentNodePos })

            // Set nodes clientRect.
            popup.setProps({
              getReferenceClientRect: () => (domNode as Element).getBoundingClientRect(),
            })

            popup.show()
          }

          return false
        },
      },
    },
  })
}
