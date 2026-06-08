import type { Node as ProseMirrorNode } from '@tiptap/pm/model'
import type { EditorView, NodeView, ViewMutationRecord } from '@tiptap/pm/view'

import { getColStyleDeclaration } from './utilities/colStyle.js'

export function updateColumns(
  node: ProseMirrorNode,
  colgroup: HTMLTableColElement, // <colgroup> has the same prototype as <col>
  table: HTMLTableElement,
  cellMinWidth: number,
  overrideCol?: number,
  overrideValue?: number,
) {
  let totalWidth = 0
  let fixedWidth = true
  let nextDOM = colgroup.firstChild
  const row = node.firstChild

  if (row !== null) {
    for (let i = 0, col = 0; i < row.childCount; i += 1) {
      const { colspan, colwidth } = row.child(i).attrs

      for (let j = 0; j < colspan; j += 1, col += 1) {
        const hasWidth =
          overrideCol === col ? overrideValue : ((colwidth && colwidth[j]) as number | undefined)
        const cssWidth = hasWidth ? `${hasWidth}px` : ''

        totalWidth += hasWidth || cellMinWidth

        if (!hasWidth) {
          fixedWidth = false
        }

        if (!nextDOM) {
          const colElement = document.createElement('col')

          const [propertyKey, propertyValue] = getColStyleDeclaration(cellMinWidth, hasWidth)

          colElement.style.setProperty(propertyKey, propertyValue)

          colgroup.appendChild(colElement)
        } else {
          if ((nextDOM as HTMLTableColElement).style.width !== cssWidth) {
            const [propertyKey, propertyValue] = getColStyleDeclaration(cellMinWidth, hasWidth)

            ;(nextDOM as HTMLTableColElement).style.setProperty(propertyKey, propertyValue)
          }

          nextDOM = nextDOM.nextSibling
        }
      }
    }
  }

  while (nextDOM) {
    const after = nextDOM.nextSibling

    nextDOM.parentNode?.removeChild(nextDOM)
    nextDOM = after
  }

  // Check if user has set a width style on the table node
  const hasUserWidth =
    node.attrs.style &&
    typeof node.attrs.style === 'string' &&
    /\bwidth\s*:/i.test(node.attrs.style)

  if (fixedWidth && !hasUserWidth) {
    table.style.width = `${totalWidth}px`
    table.style.minWidth = ''
  } else {
    table.style.width = ''
    table.style.minWidth = `${totalWidth}px`
  }
}

export class TableView implements NodeView {
  node: ProseMirrorNode

  cellMinWidth: number

  dom: HTMLDivElement

  table: HTMLTableElement

  colgroup: HTMLTableColElement

  contentDOM: HTMLTableSectionElement

  /** Optional callback that returns fresh merged HTMLAttributes for a given node. */
  private getHTMLAttributes?: (node: ProseMirrorNode) => Record<string, any>

  /** Tracks the non-style attribute keys applied by this NodeView so that only
   *  those are ever removed — other plugins may set their own attributes. */
  private managedHTMLAttributeKeys: Set<string> = new Set()

  constructor(
    node: ProseMirrorNode,
    cellMinWidth: number,
    _view?: EditorView,
    HTMLAttributes: Record<string, any> = {},
    getHTMLAttributes?: (node: ProseMirrorNode) => Record<string, any>,
  ) {
    this.node = node
    this.cellMinWidth = cellMinWidth
    this.dom = document.createElement('div')
    this.dom.className = 'tableWrapper'
    this.table = this.dom.appendChild(document.createElement('table'))
    this.getHTMLAttributes = getHTMLAttributes

    // Apply extension-configured HTMLAttributes to the table element
    // (e.g. class, data-* set via Table.configure({ HTMLAttributes }))
    for (const [key, value] of Object.entries(HTMLAttributes)) {
      if (value !== undefined && value !== null) {
        if (key === 'style') {
          this.table.style.cssText = String(value)
        } else {
          this.table.setAttribute(key, String(value))
          this.managedHTMLAttributeKeys.add(key)
        }
      }
    }

    // Apply user styles from the ProseMirror document node.
    // This may come from HTML parsing (e.g. <table style="...">) and should
    // override any style set via extension-configured HTMLAttributes above.
    if (node.attrs.style) {
      this.table.style.cssText = node.attrs.style
    }

    this.colgroup = this.table.appendChild(document.createElement('colgroup'))
    updateColumns(node, this.colgroup, this.table, cellMinWidth)
    this.contentDOM = this.table.appendChild(document.createElement('tbody'))
  }

  update(node: ProseMirrorNode) {
    if (node.type !== this.node.type) {
      return false
    }

    this.node = node
    updateColumns(node, this.colgroup, this.table, this.cellMinWidth)

    // Re-sync HTML attributes that may have changed since the NodeView was
    // created. Attributes added via addGlobalAttributes (e.g. a class set
    // through a custom command) live in node.attrs and are computed into
    // HTMLAttributes by getRenderedAttributes, but TableView.update() never
    // received them before this fix. updateColumns() already handles
    // width/minWidth via table.style, so we leave the style attribute to it.
    if (this.getHTMLAttributes) {
      const freshHTMLAttributes = this.getHTMLAttributes(node)
      const freshKeys = new Set<string>()

      // Apply new or changed non-style attributes
      for (const [key, value] of Object.entries(freshHTMLAttributes)) {
        if (key === 'style') continue
        if (value !== undefined && value !== null) {
          this.table.setAttribute(key, String(value))
          freshKeys.add(key)
        }
      }

      // Remove only keys that this NodeView previously applied and that are
      // no longer present — avoids touching attributes set by other plugins.
      for (const key of this.managedHTMLAttributeKeys) {
        if (!freshKeys.has(key)) {
          this.table.removeAttribute(key)
        }
      }

      this.managedHTMLAttributeKeys = freshKeys
    }

    return true
  }

  ignoreMutation(mutation: ViewMutationRecord) {
    const target = mutation.target as Node
    const isInsideWrapper = this.dom.contains(target)
    const isInsideContent = this.contentDOM.contains(target)

    if (isInsideWrapper && !isInsideContent) {
      if (
        mutation.type === 'attributes' ||
        mutation.type === 'childList' ||
        mutation.type === 'characterData'
      ) {
        return true
      }
    }

    return false
  }
}
