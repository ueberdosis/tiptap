import type { Editor } from '@tiptap/core'
import { Extension } from '@tiptap/core'
import type { Node as TiptapNode } from '@tiptap/pm/model'
import { v4 as uuidv4 } from 'uuid'

import { TableOfContentsPlugin } from './plugin.js'
import type {
  GetTableOfContentIndexFunction,
  GetTableOfContentLevelFunction,
  TableOfContentData,
  TableOfContentDataItem,
  TableOfContentsOptions,
  TableOfContentsStorage,
} from './types.js'
import { getHeadlineLevel, getLinearIndexes } from './utils.js'

export * from './types.js'

const addTocActiveStatesAndGetItems = (
  content: TableOfContentDataItem[],
  options: {
    editor: Editor
    anchorTypes: Array<string> | undefined
    storage: TableOfContentsStorage
    onUpdate?: (data: TableOfContentData, isCreate?: boolean) => void | undefined
  },
) => {
  const { editor } = options
  const headlines: Array<{ node: TiptapNode; pos: number }> = []
  const scrolledOverIds: string[] = []
  let activeId: string | null = null

  if (editor.isDestroyed) {
    return content
  }

  editor.state.doc.descendants((node, pos) => {
    const isValidType = options.anchorTypes?.includes(node.type.name)

    if (!isValidType) {
      return
    }

    headlines.push({ node, pos })
  })

  headlines.forEach(headline => {
    const domElement = editor.view.domAtPos(headline.pos + 1).node as HTMLHeadingElement | HTMLElement
    const scrolledOver = options.storage.scrollPosition >= domElement.offsetTop

    if (scrolledOver) {
      activeId = headline.node.attrs['data-toc-id']
      scrolledOverIds.push(headline.node.attrs['data-toc-id'])
    }
  })

  content = content.map(heading => ({
    ...heading,
    isActive: heading.id === activeId,
    isScrolledOver: scrolledOverIds.includes(heading.id),
  }))

  if (options.onUpdate) {
    const isInitialCreation = options.storage.content.length === 0

    options.onUpdate(content, isInitialCreation)
  }

  return content
}

const setTocData = (options: {
  editor: Editor
  anchorTypes: Array<string> | undefined
  getIndexFn: GetTableOfContentIndexFunction
  getLevelFn: GetTableOfContentLevelFunction
  storage: TableOfContentsStorage
  onUpdate?: (data: TableOfContentData, isCreate?: boolean) => void | undefined
}) => {
  const { editor, onUpdate } = options

  if (editor.isDestroyed) {
    return
  }

  const headlines: Array<{ node: TiptapNode; pos: number }> = []

  let anchors: TableOfContentDataItem[] = []
  const anchorEls: Array<HTMLHeadingElement | HTMLElement> = []

  editor.state.doc.descendants((node, pos) => {
    const isValidType = options.anchorTypes?.includes(node.type.name)

    if (!isValidType) {
      return
    }

    headlines.push({ node, pos })
  })

  headlines.forEach((headline, i) => {
    if (headline.node.textContent.length === 0) {
      return
    }

    const domElement = editor.view.domAtPos(headline.pos + 1).node as HTMLHeadingElement
    const scrolledOver = options.storage.scrollPosition >= domElement.offsetTop

    anchorEls.push(domElement)

    const originalLevel = headline.node.attrs.level

    const prevHeadline = headlines[i - 1]

    const level = options.getLevelFn(headline, anchors)
    const itemIndex = options.getIndexFn(headline, anchors, level)

    if (!prevHeadline) {
      anchors = [
        ...anchors,
        {
          itemIndex,
          id: headline.node.attrs['data-toc-id'],
          originalLevel,
          level,
          textContent: headline.node.textContent,
          pos: headline.pos,
          editor,
          isActive: false,
          isScrolledOver: scrolledOver,
          node: headline.node,
          dom: domElement,
        },
      ]

      return
    }

    anchors = [
      ...anchors,
      {
        itemIndex,
        id: headline.node.attrs['data-toc-id'],
        originalLevel,
        level,
        textContent: headline.node.textContent,
        pos: headline.pos,
        editor,
        isActive: false,
        isScrolledOver: false,
        node: headline.node,
        dom: domElement,
      },
    ]
  })

  anchors = addTocActiveStatesAndGetItems(anchors, options)

  if (onUpdate) {
    const isInitialCreation = options.storage.content.length === 0

    onUpdate(anchors, isInitialCreation)
  }

  options.storage.anchors = anchorEls
  options.storage.content = anchors
  editor.state.tr.setMeta('toc', anchors)
  editor.view.dispatch(editor.state.tr)
}

export const TableOfContents = Extension.create<TableOfContentsOptions, TableOfContentsStorage>({
  name: 'tableOfContents',

  addStorage() {
    return {
      content: [],
      anchors: [],
      scrollHandler: () => null,
      scrollPosition: 0,
    }
  },

  addGlobalAttributes() {
    return [
      {
        types: (this.options.anchorTypes as string[]) || ['headline'],
        attributes: {
          id: {
            default: null,
            renderHTML: attributes => {
              return {
                id: attributes.id,
              }
            },
            parseHTML: element => {
              return element.id || null
            },
          },
          'data-toc-id': {
            default: null,
            renderHTML: attributes => {
              return {
                'data-toc-id': attributes['data-toc-id'],
              }
            },
            parseHTML: element => {
              return element.dataset.tocId || null
            },
          },
        },
      },
    ]
  },

  addOptions() {
    const defaultScrollParent = typeof window !== 'undefined' ? () => window : undefined

    return {
      // eslint-disable-next-line
      onUpdate: () => {},
      // eslint-disable-next-line
      getId: _textContent => uuidv4(),

      scrollParent: defaultScrollParent,

      anchorTypes: ['heading'],
    }
  },

  addCommands() {
    return {
      updateTableOfContents:
        () =>
        ({ dispatch }) => {
          if (dispatch) {
            setTocData({
              editor: this.editor,
              storage: this.storage,
              onUpdate: this.options.onUpdate?.bind(this),
              getIndexFn: this.options.getIndex || getLinearIndexes,
              getLevelFn: this.options.getLevel || getHeadlineLevel,
              anchorTypes: this.options.anchorTypes,
            })
          }

          return true
        },
    }
  },

  onTransaction({ transaction }) {
    if (transaction.docChanged && !transaction.getMeta('toc')) {
      setTocData({
        editor: this.editor,
        storage: this.storage,
        onUpdate: this.options.onUpdate?.bind(this),
        getIndexFn: this.options.getIndex || getLinearIndexes,
        getLevelFn: this.options.getLevel || getHeadlineLevel,
        anchorTypes: this.options.anchorTypes,
      })
    }
  },

  onCreate() {
    // Avoid mutating the document during server-side rendering.
    if (typeof window === 'undefined' || !this.editor.view) {
      return
    }

    const { tr } = this.editor.state
    const existingIds: string[] = []

    if (this.options.scrollParent && typeof this.options.scrollParent !== 'function') {
      console.warn(
        "[Tiptap Table of Contents Deprecation Notice]: The 'scrollParent' option must now be provided as a callback function that returns the 'scrollParent' element. The ability to pass this option directly will be deprecated in future releases.",
      )
    }

    this.editor.state.doc.descendants((node, pos) => {
      const nodeId = node.attrs['data-toc-id']
      const isValidType = this.options.anchorTypes?.includes(node.type.name)

      if (!isValidType || node.textContent.length === 0) {
        return
      }

      if (nodeId === null || nodeId === undefined || existingIds.includes(nodeId)) {
        let id = ''

        if (this.options.getId) {
          id = this.options.getId(node.textContent)
        } else {
          id = uuidv4()
        }

        tr.setNodeMarkup(pos, undefined, {
          ...node.attrs,
          'data-toc-id': id,
          id,
        })
      }

      existingIds.push(nodeId)
    })

    this.editor.view.dispatch(tr)

    setTocData({
      editor: this.editor,
      storage: this.storage,
      onUpdate: this.options.onUpdate?.bind(this),
      getIndexFn: this.options.getIndex || getLinearIndexes,
      getLevelFn: this.options.getLevel || getHeadlineLevel,
      anchorTypes: this.options.anchorTypes,
    })

    this.storage.scrollHandler = () => {
      if (!this.options.scrollParent) {
        return
      }

      // if scrollParent is HTML Element, use scrollTop - otherwise use scrollY
      const scrollParent =
        typeof this.options.scrollParent === 'function' ? this.options.scrollParent() : this.options.scrollParent

      const scrollPosition = scrollParent instanceof HTMLElement ? scrollParent.scrollTop : scrollParent.scrollY

      this.storage.scrollPosition = scrollPosition || 0

      const updatedItems = addTocActiveStatesAndGetItems(this.storage.content, {
        editor: this.editor,
        anchorTypes: this.options.anchorTypes,
        storage: this.storage,
        onUpdate: this.options.onUpdate?.bind(this),
      })

      this.storage.content = updatedItems
    }

    if (!this.options.scrollParent) {
      return
    }

    const scrollParent =
      typeof this.options.scrollParent === 'function' ? this.options.scrollParent() : this.options.scrollParent

    if (scrollParent) {
      scrollParent.addEventListener('scroll', this.storage.scrollHandler)
    }
  },

  onDestroy() {
    if (!this.options.scrollParent) {
      return
    }

    const scrollParent =
      typeof this.options.scrollParent === 'function' ? this.options.scrollParent() : this.options.scrollParent

    if (scrollParent) {
      scrollParent.removeEventListener('scroll', this.storage.scrollHandler)
    }
  },

  addProseMirrorPlugins() {
    return [TableOfContentsPlugin({ getId: this.options.getId, anchorTypes: this.options.anchorTypes })]
  },
})
