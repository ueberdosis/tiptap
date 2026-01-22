import type { Editor } from '@dibdab/core'
import type { Node } from '@dibdab/pm/model'

export type GetTableOfContentLevelFunction = (
  headline: { node: Node; pos: number },
  previousItems: TableOfContentDataItem[],
) => number

export type GetTableOfContentIndexFunction = (
  headline: { node: Node; pos: number },
  previousItems: TableOfContentDataItem[],
  currentLevel?: number,
) => number

export type TableOfContentsOptions = {
  getId?: (textContent: string) => string
  onUpdate?: (data: TableOfContentData, isCreate?: boolean) => void
  getLevel?: GetTableOfContentLevelFunction
  getIndex?: GetTableOfContentIndexFunction
  scrollParent?: (() => HTMLElement | Window) | HTMLElement | Window
  anchorTypes?: Array<string>
}

export type TableOfContentsStorage = {
  content: TableOfContentData
  anchors: Array<HTMLHeadingElement | HTMLElement>
  scrollHandler: () => void
  scrollPosition: number
}

export type TableOfContentData = Array<TableOfContentDataItem>

export type TableOfContentDataItem = {
  dom: HTMLHeadingElement
  editor: Editor
  id: string
  isActive: boolean
  isScrolledOver: boolean
  itemIndex: number
  level: number
  node: Node
  originalLevel: number
  pos: number
  textContent: string
}

declare module '@dibdab/core' {
  interface Commands<ReturnType> {
    tableOfContents: {
      updateTableOfContents: () => ReturnType
    }
  }

  interface Storage {
    tableOfContents: TableOfContentsStorage
  }
}
