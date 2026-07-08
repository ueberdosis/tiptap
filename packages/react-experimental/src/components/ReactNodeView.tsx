/** @jsxImportSource react */
import { getRenderedAttributes } from '@tiptap/core'
import type { Node as ProseMirrorNode } from '@tiptap/pm/model'
import type { Decoration, DecorationSource } from '@tiptap/pm/view'
import type { ReactNode } from 'react'
import { useCallback, useLayoutEffect, useRef } from 'react'

import { useEditorContext } from '../contexts/EditorContext.js'
import type { NodeViewHandlers } from '../contexts/NodeViewContext.js'
import { NodeViewContext } from '../contexts/NodeViewContext.js'
import { mergeElementDecoAttrs } from '../decorations/outerDeco.js'
import { useNodeViewDesc } from '../hooks/useNodeViewDesc.js'
import type { NodeViewComponent } from './NodeViewComponentProps.js'

export interface ReactNodeViewHostProps {
  node: ProseMirrorNode
  /** Whether the node is node-selected (computed by the parent). */
  selected: boolean
  outerDeco: readonly Decoration[]
  innerDeco: DecorationSource
  component: NodeViewComponent
  /** Pre-rendered content (the dispatcher builds it to avoid module cycles). */
  children?: ReactNode
}

/**
 * Renders a user React node view component with the node view contract and
 * keeps the node's desc registered against the element the component
 * attaches `ref` to. No wrapper DOM, no portal.
 */
export function ReactNodeView({
  node,
  selected,
  outerDeco,
  innerDeco,
  component: Component,
  children,
}: ReactNodeViewHostProps): ReactNode {
  const { editor } = useEditorContext()
  const domRef = useRef<HTMLElement | null>(null)
  const contentRef = useRef<HTMLElement | null>(null)
  const handlersRef = useRef<NodeViewHandlers>({})

  const descRef = useNodeViewDesc({
    node,
    domRef,
    getContentDOM: () => (node.isLeaf ? null : contentRef.current),
    outerDeco,
    innerDeco,
  })

  // Wire the desc to the handlers ref: the component's hooks write into the
  // ref (its effects run before the desc exists), the desc dereferences it
  // at event time
  useLayoutEffect(() => {
    const desc = descRef.current

    if (desc) {
      desc.stopEventHandler = event => handlersRef.current.stopEvent?.(event)
      desc.ignoreMutationHandler = mutation => handlersRef.current.ignoreMutation?.(mutation)
    }
  })

  const getPos = useCallback(() => {
    const desc = descRef.current

    return desc?.parent ? desc.posBefore : undefined
  }, [descRef])

  const updateAttributes = useCallback(
    (attributes: Record<string, unknown>) => {
      const position = getPos()
      const current = position === undefined ? null : editor?.state.doc.nodeAt(position)

      if (!editor || position === undefined || !current) {
        return
      }

      // AttrStep instead of setNodeMarkup: markup replacement would map the
      // node as deleted, dropping its reactKeys key and remounting it
      const { tr } = editor.state

      Object.entries(attributes).forEach(([name, value]) => {
        tr.setNodeAttribute(position, name, value)
      })
      editor.view.dispatch(tr)
    },
    [editor, getPos],
  )

  const deleteNode = useCallback(() => {
    const position = getPos()
    const current = position === undefined ? null : editor?.state.doc.nodeAt(position)

    if (!editor || position === undefined || !current) {
      return
    }
    editor.view.dispatch(editor.state.tr.delete(position, position + current.nodeSize))
  }, [editor, getPos])

  if (!editor) {
    throw new RangeError('[tiptap error]: React node views can only render inside an EditorContent')
  }

  const HTMLAttributes = getRenderedAttributes(
    node,
    editor.extensionManager.attributes.filter(attribute => attribute.type === node.type.name),
  )

  // Node decorations contribute attributes like any other rendered attrs, so
  // components spreading HTMLAttributes pick them up
  if (outerDeco.length) {
    Object.entries(mergeElementDecoAttrs(outerDeco)).forEach(([name, value]) => {
      if (name === 'class') {
        HTMLAttributes.class = HTMLAttributes.class ? `${HTMLAttributes.class} ${value}` : value
      } else if (name === 'style') {
        HTMLAttributes.style = HTMLAttributes.style ? `${HTMLAttributes.style};${value}` : value
      } else {
        HTMLAttributes[name] = value
      }
    })
  }

  return (
    <NodeViewContext.Provider value={{ node, getPos, selected, descRef, handlersRef }}>
      <Component
        editor={editor}
        node={node}
        HTMLAttributes={HTMLAttributes}
        getPos={getPos}
        selected={selected}
        decorations={outerDeco}
        innerDecorations={innerDeco}
        updateAttributes={updateAttributes}
        deleteNode={deleteNode}
        ref={domRef}
        contentDOMRef={contentRef}
      >
        {children}
      </Component>
    </NodeViewContext.Provider>
  )
}
